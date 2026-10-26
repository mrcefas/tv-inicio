# Início: ecrã inicial para Hisense VIDAA

Uma página leve que funciona como ecrã inicial, instalada como app pelo instalador de debug da TV.
Não mexe no sistema da TV. Para remover: pressão longa na app > Remover.

## Ver no PC
```bash
python -m http.server 8080 --directory launcher
```
Abre http://localhost:8080 e navega com as setas, Enter e Esc.

## Personalizar
Tudo está em `config.js`: apps, fundos e valores por defeito. Na TV, o botão **Aparência** muda o design, o fundo, o relógio e as apps. Fica guardado na TV.

## Instalar na TV
1. A pasta `launcher/` tem de estar num endereço público (ex.: GitHub Pages).
2. Na TV, abre o **Browser** e escreve `hisense://debug`.
3. Nome: `Início`. URL: o endereço da página. Escolhe **Install**.
4. Reinicia a TV. A app aparece no fim da lista de apps: move-a para o primeiro lugar.

Se o `hisense://debug` abrir em branco, guarda a página como favorito no Browser.

## Limites (do VIDAA, não da página)
- O botão Home do comando continua a abrir o ecrã do VIDAA.
- Uma página não consegue abrir apps nativas (Netflix, YouTube…) nem mudar de HDMI. Esses tiles mostram que botão carregar.
- **Aparência > Diagnóstico** mostra as funções que o browser da TV expõe. Uma foto desse ecrã diz se dá para fazer mais.
