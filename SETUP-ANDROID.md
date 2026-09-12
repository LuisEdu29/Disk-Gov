# CHAMOU, FALOU — gerar APK Android

## Pré-requisitos
- Node.js 20+ (22 recomendado)
- Android Studio com Android SDK instalado
- Java 21

## 1. Instalar as dependências
Na pasta do projeto:

```bash
npm install
```

## 2. Criar o projeto Android do Capacitor

```bash
npm run build
npx cap add android
npx cap sync android
```

Se o comando `npx cap add android` disser que a plataforma já existe, pule essa etapa e rode apenas:

```bash
npx cap sync android
```

## 3. Abrir no Android Studio

```bash
npx cap open android
```

No Android Studio, aguarde o Gradle terminar de sincronizar.

## 4. Gerar APK de teste

No terminal, dentro da pasta `android`:

```bash
./gradlew assembleDebug
```

No Windows PowerShell:

```powershell
.\gradlew.bat assembleDebug
```

O APK será gerado em:

`android/app/build/outputs/apk/debug/app-debug.apk`

## 5. APK para distribuição

No Android Studio, use **Build > Generate Signed App Bundle / APK** e escolha **APK** para gerar uma versão assinada.

Para Google Play, prefira **Android App Bundle (AAB)**.

## Observações
- O `vite.config.js` usa `base: './'`, necessário para os arquivos locais funcionarem dentro do app Android.
- O botão **Ligar** foi preparado para abrir a chamada telefônica usando `tel:` no celular.
- O identificador Android definido é `com.chamoufalou.app`.
