from django.test import TestCase
from inventory.serializers import BatchSerializer
from products.models import Product, Category, Unit


class BatchSerializerTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Alimentos")
        self.unit = Unit.objects.create(name="Quilo", abbreviation="kg")
        self.product = Product.objects.create(
            name="Arroz", category=self.category, unit=self.unit, minimum_stock=1
        )

    def test_valid_quantity(self):
        s = BatchSerializer(data={
            "product": self.product.id,
            "quantity": 10,
            "expiration_date": "2030-01-01",
            "qr_code": "QR123",
        })
        self.assertTrue(s.is_valid(), s.errors)

    def test_invalid_quantity_zero(self):
        s = BatchSerializer(data={
            "product": self.product.id,
            "quantity": 0,
            "expiration_date": "2030-01-01",
            "qr_code": "QR124",
        })
        self.assertFalse(s.is_valid())
        self.assertIn("quantity", s.errors)
        self.assertEqual(
            s.errors["quantity"][0],
            "A quantidade deve ser maior que zero."
        )
        