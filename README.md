# Centro de treinamento
O intuito do [projeto](https://youtu.be/8-WcDN-CM3Y) é permitir aos alunos o acesso aos seus treinos através de um smartphone. O sistema permite ao administrador o cadastro de administradores, cadastro de alunos, cadastro de exercícios, cadastro dos treinos e permite ao aluno a visualização dos seus treinos. A visualização dos treinos incluem os exercícios com uma descrição e uma curta animação que mostra a maneira correta de como executá-lo. O sistema está responsivo, então pode ser acessado através de um smartphone ou de um computador.

## Tecnologia
Projeto criado com a biblioteca [ReactJS](https://create-react-app.dev/docs/getting-started) usando a linguagem TypeScript e o banco de dados Cloud Firestore da plataforma Firebase.

## Configuração

Para configurar o Firebase é necessário criar um arquivo .env na pasta raíz do projeto com as variáveis de identificação que ele precisa. O arquivo deve conter as seguintes variáveis de ambiente:
```
REACT_APP_FIREBASE_API_KEY = "YOUR-UNIQUE-CREDENTIALS"
REACT_APP_FIREBASE_AUTH_DOMAIN = "YOUR-PROJECT-NAME.firebaseapp.com"
REACT_APP_FIREBASE_PROJECT_ID = "YOUR-PROJECT-FIREBASE-PROJECT-ID"
REACT_APP_FIREBASE_STORAGE_BUCKET = "YOUR-PROJECT-NAME.appspot.com"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = "YOUR-PROJECT-SENDER-ID"
REACT_APP_FIREBASE_APP_ID = "YOUR-PROJECT-APP-ID"
REACT_APP_FIREBASE_MEASUREMENT_ID = "YOUR-MEASUREMENT-ID"
```
Essas variáveis são conseguidas nas configurações do sdk de um web app, que fica nas configurações do projeto no site do firebase.

## Scripts disponíveis

No diretório do projeto, você pode rodar:

### `npm install`

Ao baixar o repositório, é importante executar esse comando para que as dependências como firebase e react-router-dom, sejam instaladas no projeto.

### `npm start`

Roda o aplicativo no modo desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizar a página no navegador.

A página vai recarregar se você fizer mudanças.\
Você também poderá ver possíveis erros impressos no console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Links que podem ser úteis

[Documentação ReactJS](https://create-react-app.dev/docs/getting-started) <br/>
[Documentação Firestore](https://firebase.google.com/docs/firestore/quickstart).