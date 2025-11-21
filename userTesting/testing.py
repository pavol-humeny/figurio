import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
import sys

def visualize_csv(csv_path: str):
    # Load CSV
    df = pd.read_csv(csv_path)

    # Select only numeric columns
    numeric_df = df.select_dtypes(include=['int64', 'float64'])

    if numeric_df.empty:
        print("Chyba: CSV neobsahuje žiadne numerické stĺpce.")
        return

    # Compute per-test average across users
    test_averages = numeric_df.mean(axis=1)

    # Compute overall average
    overall_mean = numeric_df.mean().mean()

    print("Priemer pre každý test:")
    print(test_averages)
    print(f"\nCelkový priemer: {overall_mean:.3f}")

    # Plot
    plt.figure(figsize=(12, 6))

    # Plot individual users as lines, exclude last column
    for col in numeric_df.columns[:-1]:
        plt.plot(df.index, numeric_df[col], marker="o", label=col)

    # X-axis labels correspond to všetky úlohy, vrátane posledného stĺpca
    plt.xticks(df.index, df.iloc[:, 0], rotation=45, ha="right")

    # Plot per-test average as bars (transparent)
    plt.bar(df.index, test_averages, alpha=0.3, color='gray', label='Priemer testu')

    # Horizontal line for overall average only
    plt.axhline(overall_mean, color='red', linestyle='--', linewidth=2, label=f'Celkový priemer ({overall_mean:.2f})')

    plt.xticks(df.index, df.iloc[:, 0], rotation=45, ha="right")  # show first column (text) as labels
    plt.ylim(0, 5.5)  # scale from 0 to 6
    plt.ylabel("Hodnotenie")
    plt.title("Hodnotenia používateľov s priemernými hodnotami testov")
    plt.grid(axis='y', linestyle=':', alpha=0.7)
    plt.legend()

    # Save figure as PNG
    out_path_png = Path(csv_path).with_name(Path(csv_path).stem + "_graf.png")
    plt.savefig(out_path_png, dpi=150)
    print(f"\nGraf uložený ako: {out_path_png}")

    # Save figure as PDF
    out_path_pdf = Path(csv_path).with_name(Path(csv_path).stem + "_graf.pdf")
    plt.savefig(out_path_pdf)
    print(f"Graf uložený aj ako PDF: {out_path_pdf}")

    plt.show()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Použitie: python testing.py data.csv")
        sys.exit(1)

    visualize_csv(sys.argv[1])
