# Commands

Firstly install the dependencies
```
yarn install
```

Excecute on shell to generate the keys
```
npx web-push generate-vapid-keys
```

And paste the result on .env file
```
PUBLIC_VAPID_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PRIVATE_VAPID_KEY=xxxxxxxxxxxx
```

Start in developer mode at port 3000
```
yarn start dev
```

