from django.core.management.base import BaseCommand

from products.models import Category, Product, Unit


class Command(BaseCommand):
    help = "Popula unidades, categorias e produtos alimenticios principais."

    UNITS = [
        {"name": "Litros", "abbreviation": "L"},
        {"name": "Unidades", "abbreviation": "Un"},
        {"name": "Mililitros", "abbreviation": "ml"},
        {"name": "Kilogramas", "abbreviation": "Kg"},
        {"name": "Gramas", "abbreviation": "g"},
        {"name": "Pecas", "abbreviation": "Pc"},
    ]

    CATALOG = {
        "Grãos e Cereais": [
            ("Arroz", "Kg", 5),
            ("Feijao Carioca", "Kg", 3),
            ("Feijao Preto", "Kg", 3),
            ("Milho para Pipoca", "Kg", 1),
            ("Aveia em Flocos", "g", 500),
        ],
        "Leguminosas": [
            ("Lentilha", "Kg", 1),
            ("Grao de Bico", "Kg", 1),
            ("Ervilha Seca", "Kg", 1),
            ("Soja em Graos", "Kg", 1),
        ],
        "Farinhas e Massas": [
            ("Farinha de Trigo", "Kg", 2),
            ("Farinha de Mandioca", "Kg", 2),
            ("Macarrao Espaguete", "Kg", 2),
            ("Macarrao Parafuso", "Kg", 2),
            ("Fuba", "Kg", 1),
        ],
        "Carnes e Aves": [
            ("Peito de Frango", "Kg", 3),
            ("Coxa de Frango", "Kg", 3),
            ("Carne Bovina", "Kg", 3),
            ("Carne Suina", "Kg", 2),
            ("Linguica", "Kg", 2),
        ],
        "Peixes e Frutos do Mar": [
            ("File de Tilapia", "Kg", 2),
            ("Sardinha", "Un", 12),
            ("Atum em Lata", "Un", 12),
        ],
        "Laticínios": [
            ("Leite Integral", "L", 12),
            ("Leite Desnatado", "L", 6),
            ("Queijo Mussarela", "Kg", 2),
            ("Iogurte Natural", "Un", 12),
            ("Manteiga", "g", 500),
        ],
        "Hortifruti": [
            ("Batata", "Kg", 5),
            ("Cebola", "Kg", 3),
            ("Tomate", "Kg", 3),
            ("Banana", "Kg", 4),
            ("Maca", "Kg", 4),
            ("Alface", "Pc", 10),
        ],
        "Panificação": [
            ("Pao Frances", "Un", 30),
            ("Pao de Forma", "Un", 8),
            ("Bolo Simples", "Un", 4),
            ("Torrada", "Un", 8),
        ],
        "Bebidas": [
            ("Agua Mineral", "L", 24),
            ("Suco de Laranja", "L", 8),
            ("Refrigerante Cola", "L", 12),
            ("Cafe Pronto", "ml", 2000),
        ],
        "Enlatados e Conservas": [
            ("Milho Verde em Lata", "Un", 12),
            ("Ervilha em Lata", "Un", 12),
            ("Molho de Tomate", "Un", 12),
            ("Palmito", "Un", 6),
        ],
        "Condimentos e Temperos": [
            ("Sal", "Kg", 2),
            ("Acucar", "Kg", 5),
            ("Pimenta do Reino", "g", 200),
            ("Oregano", "g", 200),
            ("Vinagre", "L", 2),
            ("Oleo de Soja", "L", 6),
        ],
        "Congelados": [
            ("Legumes Congelados", "Kg", 2),
            ("Batata Frita Congelada", "Kg", 2),
            ("Hamburguer Congelado", "Un", 20),
            ("Pizza Congelada", "Un", 10),
        ],
    }

    CATEGORY_ALIASES = {
        "Grãos e Cereais": ["Graos e Cereais"],
        "Laticínios": ["Laticinios"],
        "Panificação": ["Panificacao"],
    }

    @staticmethod
    def _find_category(canonical_name, aliases):
        names = [canonical_name, *aliases]
        return Category.objects.filter(name__in=names).order_by("id").first()

    def handle(self, *args, **options):
        units_by_abbr = {}
        units_created = 0
        categories_created = 0
        products_created = 0

        for unit_data in self.UNITS:
            unit = Unit.objects.filter(abbreviation=unit_data["abbreviation"]).first()
            if not unit:
                unit = Unit.objects.create(**unit_data)
                units_created += 1
            units_by_abbr[unit.abbreviation] = unit

        for category_name, products in self.CATALOG.items():
            aliases = self.CATEGORY_ALIASES.get(category_name, [])
            category = self._find_category(category_name, aliases)
            if not category:
                category = Category.objects.create(name=category_name)
                categories_created += 1

            for product_name, unit_abbr, min_stock in products:
                existing_product = Product.objects.filter(
                    name=product_name, category=category
                ).first()
                if existing_product:
                    continue

                Product.objects.create(
                    name=product_name,
                    category=category,
                    unit=units_by_abbr[unit_abbr],
                    minimum_stock=min_stock,
                )
                products_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed concluido. Unidades criadas: {units_created}, "
                f"categorias criadas: {categories_created}, "
                f"produtos criados: {products_created}."
            )
        )
