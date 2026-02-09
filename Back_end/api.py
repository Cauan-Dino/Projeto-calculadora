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
    C: Optional[float] = 0 # C = Valor Inicial
    A: Optional[float] = 0 # A = Aporte Mensal
    T: int # T = Tempo
    taxa_juros: float
    taxa_juros_mensal: bool = False
    tempo_mensal: bool = False

class CalculadoraAposentadoria(BaseModel):
    R: float # R = Renda deseja
    T: int # T = Tempo
    I: float # I = inflacao
    Rendimento_investimento: float # Rendimento = rendimento desejado


# Calculadora de juros compostos
@app.post('/calculadora')
def tabela_juros(body: Calculadora):

    i = body.taxa_juros / 100 # I = Taxa de juros em decimais

    if i <= 0:
        raise HTTPException(
            status_code=400,
            detail='Selecione uma taxa de juros!'
        )

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

    for mes in range(T + 1):

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

# Calculadora que mostra quanto o usuario precisa para se aposentar
@app.post('/aposentadoria-calculadora')
def aposentadoria_calculadora(body:CalculadoraAposentadoria):
    # Verificando se o usuario colocou algo no campo R e T
    if body.R <= 0 or body.T <= 0:
        raise HTTPException(
            status_code=400, 
            detail="Valores inválidos."
            )
    
    # Colocando em decimais
    Rendimento = body.Rendimento_investimento / 100
    I = body.I / 100 
    
    # 1. Calcular a taxa real anual
    renda_real_anual = (1 + Rendimento) / (1 + I) - 1 
    
    # 2. Converter para taxa real mensal
    real_mes = (1+renda_real_anual)**(1/12) -1

    # Convertendo anos para meses
    n = body.T * 12
    
    # 3. fórmula do valor presente da renda
    if real_mes == 0:
        VP = body.R * n
    else:        
        VP = body.R * (1-(1+real_mes)**-n) / real_mes

    # Informações extras
    total_recebido = body.R * n

    return {
        "valor_necessario_hoje": round(VP, 2),
        "total_recebido_no_periodo": round(total_recebido, 2),
        "taxa_real_anual_%": round(renda_real_anual * 100, 2),
        "taxa_real_mensal_%": round(real_mes * 100, 4),
        "meses": n
    }



