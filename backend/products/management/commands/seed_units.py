from django.core.management.base import BaseCommand

from products.models import Unit


class Command(BaseCommand):
    help = "Popula unidades padrao de medida."

    UNITS = [
        {"name": "Litros", "abbreviation": "L"},
        {"name": "Unidades", "abbreviation": "Un"},
        {"name": "Mililitros", "abbreviation": "ml"},
        {"name": "Kilogramas", "abbreviation": "Kg"},
        {"name": "Gramas", "abbreviation": "g"},
        {"name": "Pecas", "abbreviation": "Pc"},
    ]

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for unit_data in self.UNITS:
            unit, created = Unit.objects.get_or_create(
                abbreviation=unit_data["abbreviation"],
                defaults={"name": unit_data["name"]},
            )
            if created:
                created_count += 1
                continue

            if unit.name != unit_data["name"]:
                unit.name = unit_data["name"]
                unit.save(update_fields=["name", "updated_at"])
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed de units concluido. Criadas: {created_count}, atualizadas: {updated_count}."
            )
        )
