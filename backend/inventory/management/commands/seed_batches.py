from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from inventory.models import Batch
from products.models import Product
from users.models import User


class Command(BaseCommand):
    help = "Popula lotes (batches) iniciais para os produtos cadastrados."

    BATCH_WINDOWS_DAYS = [30, 90]

    @staticmethod
    def _base_quantity(product):
        minimum = float(product.minimum_stock or 0)
        if minimum <= 0:
            return 10.0
        return max(minimum * 2, 1.0)

    def handle(self, *args, **options):
        products = Product.objects.select_related("category", "unit").all().order_by("id")
        if not products.exists():
            self.stdout.write(
                self.style.WARNING(
                    "Nenhum produto encontrado. Rode o seed de produtos antes do seed de lotes."
                )
            )
            return

        created_by = User.objects.filter(is_superuser=True).order_by("id").first()
        today = timezone.localdate()
        batches_created = 0

        for product in products:
            base_quantity = self._base_quantity(product)

            for index, days_ahead in enumerate(self.BATCH_WINDOWS_DAYS, start=1):
                qr_code = f"SEED-{product.id}-{index:02d}"
                expiration_date = today + timedelta(days=days_ahead)
                quantity = base_quantity * index

                _, created = Batch.objects.get_or_create(
                    qr_code=qr_code,
                    defaults={
                        "product": product,
                        "quantity": quantity,
                        "expiration_date": expiration_date,
                        "created_by": created_by,
                    },
                )
                if created:
                    batches_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed de lotes concluido. Lotes criados: {batches_created}."
            )
        )
