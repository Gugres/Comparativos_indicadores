# Notas:
#  - Tentar criar uma função para converter os valores de string para inteiro

import sys
import pandas as pd

def main():
  df_B3 = pd.read_excel("dados/Setorial_B3_simplificado.xlsx")
  df_indicadores = pd.read_excel("dados/fundamentus_ind.xlsx").T
  df_relatorio = pd.read_excel("dados/relatorio_final_pupx.xlsx")
  df_saida = pd.DataFrame()

  columns = df_indicadores.columns
  for x in columns:
    try:
      df_indicadores[x] = df_indicadores[x].map(lambda p: p.strip("%"))
      df_indicadores[x] = df_indicadores[x].replace(to_replace=",", value=".", regex=True).astype(float)
      print(x)
    except:
      continue
  print(columns)
  sys.exit()

  for i in range(1):
    ativo = df_relatorio.alvo[i]
    ativo_B3 = ativo[:4]
    setor = df_B3.loc[df_B3.Ativo == ativo_B3].Setor
    ativos_setor = df_B3.loc[df_B3.Setor == setor.iloc[0]].Ativo.reset_index()
    ativos_setor = ativos_setor["Ativo"].tolist()
    ativos_fundamentus = BuscaAtivosPresentes(df_indicadores.index, ativos_setor)

    df_ativo = df_indicadores.loc[ativo]
    break

def BuscaAtivosPresentes(ativos_fundamentus, ativos_setor):
  ativos_presentes = []
  for x in ativos_setor:
    x += "3"
    if x in ativos_fundamentus:
      ativos_presentes.append(x)
  return ativos_presentes

# def TiraPorcentagem(x):
#   columns = ["Cresc.5a","DY","EV/EBIT","EV/EBITDA","Liq.2m.","Liq.Corr.","Mrg.Liq.","P/Ativ.Circ.Liq.","P/Ativo","P/Cap.Giro","P/EBIT","P/L","P/VP","PSR","ROE","ROIC","cotacao"]
#   # for x in columns:
#     # df_indicadores[x] = df_indicadores[x].str.replace('%', '')
#     # print(df_indicadores[x].head())
#     # df_indicadores[x] = df_indicadores[x].astype(float)
#   return x.strip("%")

if __name__ == "__main__":
  main()