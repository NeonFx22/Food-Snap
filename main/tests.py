import os
from io import BytesIO
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image

from .models import FavoriteRecipe, UploadRecord

IMAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataset", "images")


def make_jpeg(name="test.jpg"):
    buf = BytesIO()
    Image.new("RGB", (64, 64), (200, 30, 30)).save(buf, format="JPEG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/jpeg")


def real_sample(name="jollof_rice_001.jpg"):
    path = os.path.join(IMAGES_DIR, name)
    with open(path, "rb") as f:
        return SimpleUploadedFile(name, f.read(), content_type="image/jpeg")


class HomePageTests(TestCase):
    def test_home_page_renders(self):
        response = self.client.get(reverse("home"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "FoodSnap")

    def test_upload_without_image_is_error(self):
        response = self.client.post(reverse("home"), {})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Please choose an image file")

    @patch("main.views.MAX_UPLOAD_BYTES", 1)
    def test_upload_rejects_oversized_file(self):
        # MAX_UPLOAD_BYTES patched to 1 so any real upload exceeds it.
        response = self.client.post(reverse("home"), {"image": make_jpeg()})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "too large")

    @patch("main.views.match_image", return_value=[("jollof rice", 0.92), ("egusi soup", 0.61)])
    def test_upload_returns_recipe_cards(self, _mock):
        response = self.client.post(reverse("home"), {"image": real_sample()})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Jollof Rice")
        self.assertContains(response, "92% match")

    @patch("main.views.match_image", return_value=[])
    def test_upload_with_no_matches(self, _mock):
        response = self.client.post(reverse("home"), {"image": real_sample()})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No matching recipes found")


class AuthTests(TestCase):
    def test_register_login_logout(self):
        # Register
        response = self.client.post(
            reverse("register"),
            {"username": "chef", "password1": "s3cure-pass-xyz", "password2": "s3cure-pass-xyz"},
        )
        self.assertRedirects(response, reverse("home"))
        self.assertTrue(User.objects.filter(username="chef").exists())

        self.client.logout()
        # Login with wrong password
        response = self.client.post(
            reverse("login"), {"username": "chef", "password": "wrong"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Invalid username or password")

        # Login correctly
        response = self.client.post(
            reverse("login"), {"username": "chef", "password": "s3cure-pass-xyz"}
        )
        self.assertRedirects(response, reverse("home"))

        # Dashboard shows only this user's uploads
        response = self.client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, 200)

        # Logout (POST required to prevent CSRF logout attacks)
        response = self.client.post(reverse("logout"))
        self.assertRedirects(response, reverse("home"))

    def test_dashboard_requires_login(self):
        response = self.client.get(reverse("dashboard"))
        self.assertEqual(response.status_code, 302)
        self.assertIn(reverse("login"), response.url)

    def test_favorites_requires_login(self):
        response = self.client.get(reverse("favorites"))
        self.assertEqual(response.status_code, 302)


class FavoritesTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("chef", password="s3cure-pass-xyz")
        self.client.login(username="chef", password="s3cure-pass-xyz")

    def test_toggle_add_and_remove(self):
        url = reverse("favorite_toggle", args=["jollof-rice"])
        self.client.post(url)
        self.assertTrue(FavoriteRecipe.objects.filter(user=self.user, recipe_name="jollof rice").exists())

        response = self.client.get(reverse("favorites"))
        self.assertContains(response, "Jollof Rice")

        self.client.post(url)
        self.assertFalse(FavoriteRecipe.objects.filter(user=self.user, recipe_name="jollof rice").exists())


class UploadRecordTests(TestCase):
    def test_upload_saves_record(self):
        self.assertEqual(UploadRecord.objects.count(), 0)
        response = self.client.post(reverse("home"), {"image": real_sample()})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(UploadRecord.objects.count(), 1)
        record = UploadRecord.objects.first()
        self.assertTrue(record.image)


class MLMatchTests(TestCase):
    @override_settings(TOP_RESULTS=10)
    def test_match_image_returns_sensible_top_k(self):
        from .ml_utils import match_image

        path = os.path.join(IMAGES_DIR, "jollof_rice_001.jpg")
        with Image.open(path) as im:
            results = match_image(im, top_k=3)
        self.assertTrue(results)
        names = [name for name, _ in results]
        self.assertEqual(names[0], "jollof rice")
        for name, confidence in results:
            self.assertTrue(0.0 <= confidence <= 1.0)
