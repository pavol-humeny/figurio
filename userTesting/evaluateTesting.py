"""
UX Testing Visualization Script
================================

Tento skript slúži na vizualizáciu výsledkov používateľského testovania
uložených v CSV súbore v task-centric formáte.

Každá metrika (napr. clarity, task_success, error_count) je vykreslená
ako samostatný graf, kde:
- čiary reprezentujú jednotlivých používateľov
- sivé stĺpce reprezentujú priemer úlohy
- červená prerušovaná čiara reprezentuje celkový priemer úloh


--------------------------------
PRÍKLADY SPUSTENIA
--------------------------------
python evaluateTesting.py data.csv --testing-number 2

--------------------------------
VYSVETLENIE PREPÍNAČOV
--------------------------------

--type METRIC
    Názov metriky, ktorú chceš vizualizovať.
    Ak nie je zadaný, spracujú sa všetky metriky v CSV.
    Príklady: clarity, task_success, error_count

--testing-number N
    Číslo testovania (napr. iterácia UX testu).
    Použije sa ako prefix názvov výstupných súborov.
    Príklad: T1_data_clarity.pdf

--export-type {pdf|png|all}
    Typ exportu grafov.
    - pdf  → exportuje len PDF (default)
    - png  → exportuje len PNG
    - all  → exportuje PDF aj PNG

--show
    Ak je použitý, grafy sa po vygenerovaní aj zobrazia.
    Ak nie je použitý, skript iba exportuje súbory.
"""

import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
import textwrap
import argparse

def visualize_csv(
    csv_path: str,
    metric_filter: str | None,
    testing_number: str | None,
    export_type: str,
    show: bool,
):
    # Load CSV
    df = pd.read_csv(csv_path)

    # Detect user columns (numeric only)
    user_cols = df.select_dtypes(include=["int64", "float64"]).columns.tolist()
    if not user_cols:
        print("Chyba: CSV neobsahuje žiadne numerické stĺpce používateľov.")
        return

    metrics = df["metric"].unique()

    if metric_filter:
        if metric_filter not in metrics:
            print(f"Chyba: metrika '{metric_filter}' neexistuje v CSV.")
            print(f"Dostupné metriky: {', '.join(metrics)}")
            return
        metrics = [metric_filter]

    for metric in metrics:
        metric_df = (
            df[df["metric"] == metric]
            .sort_values("task_id")   # task_id only for ordering
            .reset_index(drop=True)
        )

        # Compute averages
        task_avg = metric_df[user_cols].mean(axis=1)
        overall_avg = task_avg.mean()

        print(f"\n=== METRIKA: {metric.upper()} ===")
        print("Priemery úloh:")
        print(task_avg)
        print(f"Celkový priemer úloh: {overall_avg:.3f}")

        x = range(len(metric_df))

        plt.figure(figsize=(14, 7))

        # User lines
        for col in user_cols:
            plt.plot(
                x,
                metric_df[col],
                marker="o",
                linewidth=1.5,
                label=col
            )

        # Task average bars
        plt.bar(
            x,
            task_avg,
            alpha=0.3,
            color="gray",
            label="Priemer úlohy"
        )

        # Overall average horizontal line
        plt.axhline(
            overall_avg,
            color="red",
            linestyle="--",
            linewidth=2,
            label=f"Celkový priemer ({overall_avg:.2f})"
        )

        # X-axis labels (task descriptions only)
        wrapped_labels = [
            "\n".join(textwrap.wrap(desc, 22))
            for desc in metric_df["task_description"]
        ]
        plt.xticks(x, wrapped_labels, ha="center")

        # Optional Y-axis limits
        if metric == "clarity":
            plt.ylim(0, 3)
        elif metric == "task_success":
            plt.ylim(0, 1)

        plt.ylabel(metric)
        plt.grid(axis="y", linestyle=":", alpha=0.7)
        plt.legend()
        plt.tight_layout()

        # File name prefix
        prefix = f"T{testing_number}_" if testing_number else ""
        base = Path(csv_path).with_suffix("")

        if export_type in ("png", "all"):
            out_png = base.with_name(f"{prefix}{base.stem}_{metric}.png")
            plt.savefig(out_png, dpi=150)
            print(f"PNG uložený: {out_png}")

        if export_type in ("pdf", "all"):
            out_pdf = base.with_name(f"{prefix}{base.stem}_{metric}.pdf")
            plt.savefig(out_pdf)
            print(f"PDF uložený: {out_pdf}")

        # Show only if explicitly requested
        if show:
            plt.show()
        else:
            plt.close()

def main():
    parser = argparse.ArgumentParser(
        description="Vizualizácia UX testovacích dát"
    )
    parser.add_argument(
        "csv",
        help="Cesta k CSV súboru"
    )
    parser.add_argument(
        "--type",
        help="Názov metriky (napr. clarity, task_success, error_count)"
    )
    parser.add_argument(
        "--testing-number",
        help="Číslo testovania (prefix názvov súborov)"
    )
    parser.add_argument(
        "--export-type",
        choices=["png", "pdf", "all"],
        default="pdf",
        help="Typ exportu (default: pdf)"
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Zobrazí grafy po vygenerovaní (inak sa len exportujú)"
    )

    args = parser.parse_args()

    visualize_csv(
        csv_path=args.csv,
        metric_filter=args.type,
        testing_number=args.testing_number,
        export_type=args.export_type,
        show=args.show,
    )

if __name__ == "__main__":
    main()