# Link do site: 

https://juros-compostoss-calculadora.netlify.app/
---
# 🚀 Calculadora Financeira Pro: Juros Compostos & Aposentadoria

Uma ferramenta web interativa, moderna e responsiva projetada para ajudar usuários a simular o crescimento de patrimônio e planejar a independência financeira. O projeto apresenta um design **Neobrutalista** com suporte completo a **Modo Escuro**.

---

## ✨ Funcionalidades

* **Simulador de Juros Compostos:** Cálculo preciso de evolução patrimonial considerando aportes mensais e juros sobre juros.
* **Calculadora de Aposentadoria:** Estimativa de patrimônio necessário baseado na renda mensal desejada e na **Taxa Real** (descontada a inflação).
* **Modo Escuro (Dark Mode):** Alternância dinâmica de temas com persistência de preferência via `localStorage`.
* **Interface Adaptável:** Design totalmente responsivo (Mobile/Desktop) utilizando Tailwind CSS.
* **Guia de Utilização:** Seção educativa integrada para explicar conceitos fundamentais como Taxa Real e Inflação.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura semântica do projeto.
* **Tailwind CSS:** Estilização moderna através de classes utilitárias.
* **JavaScript (ES6+):** Lógica de cálculo, máscaras dinâmicas de moeda e manipulação de DOM para o Modo Escuro.
* **Design de Interface:** Ícones intuitivos e tipografia de alta legibilidade.

---

## 🌙 Implementação do Modo Escuro

O projeto utiliza uma estratégia de classe mestre aplicada ao `body`. As principais melhorias incluem:

1.  **Prefixos Dark:** Cores de fundo e texto são invertidas automaticamente usando as classes `dark:` do Tailwind.
2.  **Ajuste de Contraste:** Etiquetas de prefixo (como **R$** e **%**) mudam de cinza claro para cinza chumbo (`#374151`) no modo escuro para eliminar o ofuscamento visual.
3.  **Persistência:** O tema escolhido pelo usuário é salvo no navegador, mantendo a preferência mesmo após atualizar a página.

---

## 📋 Estrutura de Arquivos

```text
├── index.html            # Calculadora principal de Juros Compostos
├── aposentadoria.html     # Calculadora de Planejamento de Aposentadoria
└── README.md             # Documentação do projeto
```

---

## 📈 Fórmulas Utilizadas

Juros Compostos

Aposentadoria (Cálculo de Perpetuidade Real)

