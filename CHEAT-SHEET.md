# @Continue
- 

# NextJS & Node CMDs:

- Run NextJS (React)

```shell
npm run dev
```

- Reinstall dependencies if you swicth/chnage Node version

> This step matters because native bindings can break across Node versions.

```shell
rm -rf node_modules package-lock.json
npm install
```

- Setting-up NextJS-Material with AppRouter

> 1️⃣ Check if Material is installed

```shell
npm ls next @mui/material
```

> 2️⃣ If they’re NOT, install Material UI (and peers)

```shell
npm install next react react-dom @mui/material @emotion/styled
```

> 3️⃣ Then continue with the MUI + Next integration

```shell
npm install @mui/material-nextjs @emotion/cache
```

> Final check

```shell
npm ls next @mui/material
```

> Expected Outcome:

```
├── next@16.1.6
└── @mui/material@x.y.z```