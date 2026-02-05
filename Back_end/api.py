from fastapi import FastAPI,HTTPException,Depends
from fastapi.security import HTTPBasic,HTTPBasicCredentials
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criacao do body

class Calculadora(BaseModel):
    C: Optional[float] = 0
    A: Optional[float] = 0
    T: int
    taxa_juros: float
    taxa_juros_mensal: bool = False
    tempo_mensal: bool = False

# T = Tempo
# A = Aporte Mensal
# C = Valor Inicial
# I = Taxa de juros em decimais

@app.post('/calculadora')
def tabela_juros(body: Calculadora):

    i = body.taxa_juros / 100

    if body.C == 0 and body.A == 0:
        raise HTTPException(status_code=400, detail='Opção inválida')

    # Converter taxa anual → mensal
    if not body.taxa_juros_mensal:
        i = (1 + i) ** (1/12) - 1

    # Converter tempo para meses
    # Converter tempo para meses (Lógica Corrigida)
    # Se tempo_mensal for True, T permanece o mesmo. 
    # Se tempo_mensal for False (Anual), T é multiplicado por 12.
    T = body.T if body.tempo_mensal else body.T * 12

    juros_mes = 0
    saldo = body.C
    total_investido = body.C
    juros_acumulado = 0
    tabela = []

    for mes in range(0, T + 1):

        tabela.append({
            "mes": mes,
            "aporte": round(body.A, 2),
            "juros_mes": round(juros_mes, 2),
            'juros_acumlado': round(juros_acumulado,2),
            "saldo_acumulado": round(saldo, 2),
            "total_investido": round(total_investido, 2)
        })
        
        juros_mes = saldo * i
        saldo += juros_mes + body.A
        total_investido += body.A
        juros_acumulado += juros_mes


    return {
        "resumo": {
            "valor_final": round(tabela[-1]['saldo_acumulado'], 2),
            "total_investido": round(tabela[-1]['total_investido'], 2),
            "total_juros": round(tabela[-1]['saldo_acumulado'] - tabela[-1]['total_investido'], 2)
        },
        "tabela": tabela
    }




