# Fluxo de Autenticação (Fricção Zero)

Para garantir acessibilidade, o processo de login tradicional é substituído por um vínculo seguro de dispositivo.

## Etapas do Onboarding

1. **Entrada de Telefone**: O usuário abre o app e insere apenas o número de celular.
2. **Envio de OTP**: O servidor envia um código de 6 dígitos via SMS ou WhatsApp.
3. **Validação Automática**: O app captura o SMS (se permitido pelo SO) ou o usuário insere o código simplificado.
4. **Geração de Token + Device ID**:
   - O backend valida o código.
   - Captura-se o identificador único do hardware (`device_id`).
   - Um JWT de longa duração é emitido e armazenado no `SecureStorage` do celular.
5. **Reentrada**: Nas próximas vezes, o app verifica o Token + Device ID. Se válidos, o usuário cai direto na tela principal.

## Segurança
- Se o passageiro trocar de aparelho, ele repete o processo de SMS.
- O `device_id` impede que o mesmo token seja usado em múltiplos aparelhos sem autorização.
- Em caso de mau uso (trotes), o `device_id` ou o `telefone` podem ser banidos permanentemente na tabela `Passageiro`.
