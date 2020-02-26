import sys
import pandas as pd

def PreparacaoIndicadores():
  df_indicadores = pd.read_excel("dados/fundamentus_ind.xlsx").T
  columns = df_indicadores.columns
  for x in columns:
    try:
      df_indicadores[x] = df_indicadores[x].map(lambda p: p.strip("%"))
      df_indicadores[x] = df_indicadores[x].apply(TiraPonto)
      df_indicadores[x] = df_indicadores[x].replace(",",".",regex=True).astype(float)
    except:
      print(x)
      continue
  df_indicadores.to_excel("dados/fundamentus_ind_ajustado.xlsx")

def main():
  df_B3 = pd.read_excel("dados/Setorial_B3_simplificado.xlsx")
  df_indicadores = pd.read_excel("dados/fundamentus_ind_ajustado.xlsx")
  df_relatorio = pd.read_excel("dados/relatorio_final_pupx.xlsx")
  df_saida = pd.DataFrame()

  for i in range(10):
    ativo = df_relatorio.alvo[i]
    ativo_B3 = ativo[:4]
    setor = df_B3.loc[df_B3.Ativo == ativo_B3].Setor
    ativos_setor = df_B3.loc[df_B3.Setor == setor.iloc[0]].Ativo.reset_index()
    ativos_setor = ativos_setor["Ativo"].tolist()
    ativos_fundamentus = BuscaAtivosPresentes(df_indicadores.index, ativos_setor)

    df_ativos_fundamentus = df_indicadores.loc[ativos_fundamentus]
    serie_ativo = df_indicadores.loc[ativo]

    serie_comparativo_media = df_ativos_fundamentus.mean()
    serie_comparativo_variancia = df_ativos_fundamentus.std()

    df_saida[ativo] = serie_ativo
    #df_saida["comparativo media: " + ativo] = serie_comparativo_media
    #df_saida["comparativo desvio padrao: " + ativo] = serie_comparativo_variancia

  df_saida.to_excel("comparativos_indicadores.xlsx")

def BuscaAtivosPresentes(ativos_fundamentus, ativos_setor):
  ativos_presentes = []
  for x in ativos_setor:
    x += "3"
    if x in ativos_fundamentus:
      ativos_presentes.append(x)
  return ativos_presentes

def TiraPonto(x):
  x_novo = ""
  for letra in x:
    if letra != ".":
      x_novo += letra
  return x_novo

def LimpezaDados(df_indicadores):
  pass

if __name__ == "__main__":
  ajuste = str(input("Deseja ajustar a tabela de indicadores? "))
  if ajuste == "s":
    PreparacaoIndicadores()
  else: main()