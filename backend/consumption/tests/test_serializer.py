from django.test import TestCase
from django.utils import timezone

from consumption.serializers import ConsumptionSerializer
from inventory.models import Batch
from products.models import Product, Category, Unit
from users.models import User

class ConsumptionSerializerTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Alimentos")
        self.unit = Unit.objects.create(name="Quilo", abbreviation="kg")
        self.product = Product.objects.create(
            name="Arroz", category=self.category, unit=self.unit, minimum_stock=1
        )
        self.batch = Batch.objects.create(
            product=self.product, quantity=10, expiration_date="2030-01-01", qr_code="QR123"
        )
        self.user = User.objects.create(username="teste")

    def test_invalid_quantity_used_zero(self):
        s = ConsumptionSerializer(data={
            "batch": self.batch.id,
            "quantity_used": 0,
            "used_by": self.user.id,
        })
        assert not s.is_valid()
        assert "quantity_used" in s.errors

    def test_invalid_quantity_used_exceeds_batch(self):
        s = ConsumptionSerializer(data={
            "batch": self.batch.id,
            "quantity_used": 11,
            "used_by": self.user.id,
        })
        assert not s.is_valid()
        assert "quantity_used" in s.errors

    def test_valid_consumption(self):
        s = ConsumptionSerializer(data={
            "batch": self.batch.id,
            "quantity_used": 5,
            "used_by": self.user.id,
        })
        assert s.is_valid(), s.errors

    def test_create_reduces_batch_quantity(self):
        s = ConsumptionSerializer(data={
            "batch": self.batch.id,
            "quantity_used": 4,
        })
        assert s.is_valid(), s.errors
        consumption = s.save(used_by=self.user)

        self.batch.refresh_from_db()
        self.assertEqual(consumption.quantity_used, 4)
        self.assertEqual(self.batch.quantity, 6)

    def test_create_blocks_expired_batch(self):
        expired_batch = Batch.objects.create(
            product=self.product,
            quantity=10,
            expiration_date=timezone.localdate() - timezone.timedelta(days=1),
            qr_code="QR-EXPIRED-1",
        )
        s = ConsumptionSerializer(data={
            "batch": expired_batch.id,
            "quantity_used": 1,
        })
        assert not s.is_valid()
        assert "batch" in s.errors
