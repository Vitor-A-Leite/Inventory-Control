import random

from django.core.management.base import BaseCommand
from django.utils import timezone

from consumption.models import Consumption
from consumption.serializers import ConsumptionSerializer
from inventory.models import Batch
from users.models import User


class Command(BaseCommand):
    help = "Registra consumos para metade dos lotes, com quantidades aleatorias validas."

    RNG_SEED = 20260316

    @staticmethod
    def _random_quantity(max_quantity):
        upper_bound = max_quantity * 0.4
        lower_bound = max_quantity * 0.05
        qty = random.uniform(lower_bound, upper_bound)
        qty = round(qty, 2)
        if qty <= 0:
            qty = 0.01
        return min(qty, max_quantity)

    def handle(self, *args, **options):
        random.seed(self.RNG_SEED)
        today = timezone.localdate()

        seed_user, _ = User.objects.get_or_create(
            username="seed_consumption_bot",
            defaults={
                "email": "seed.consumption.bot@example.com",
                "is_active": False,
            },
        )

        eligible_batches = list(
            Batch.objects.select_related("product")
            .filter(expiration_date__gte=today, quantity__gt=0)
            .order_by("created_at", "id")
        )

        if not eligible_batches:
            self.stdout.write(
                self.style.WARNING(
                    "Nenhum lote elegivel para consumo (nao vencido e com quantidade > 0)."
                )
            )
            return

        target_count = max(1, len(eligible_batches) // 2)
        selected_batches = random.sample(eligible_batches, target_count)

        created_count = 0
        skipped_existing = 0
        skipped_validation = 0

        for batch in selected_batches:
            already_seeded = Consumption.objects.filter(
                batch=batch, used_by=seed_user
            ).exists()
            if already_seeded:
                skipped_existing += 1
                continue

            quantity_used = self._random_quantity(batch.quantity)

            serializer = ConsumptionSerializer(
                data={"batch": str(batch.id), "quantity_used": quantity_used}
            )

            if not serializer.is_valid():
                skipped_validation += 1
                continue

            serializer.save(used_by=seed_user)
            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Seed de consumos concluido. "
                f"Consumos criados: {created_count}, "
                f"ja existentes: {skipped_existing}, "
                f"invalidos: {skipped_validation}."
            )
        )
