# safe-app-synthetix-mintr
Synthetix Mintr Safe app Gnosis Safe 

## Deploy to IPFS
There is a `ipfs-deploy` script defined in package.json file. In order to run this command, you first need to add these environment variables to the `.env` file.

> Note: The values for these vars are obtained from your [Pinata](https://pinata.cloud/) account. 

```bash
IPFS_DEPLOY_PINATA__API_KEY=
IPFS_DEPLOY_PINATA__SECRET_API_KEY=
```

Once this vars are set properly, you can run `yarn ipfs-deploy` command and it will build and upload to IPFS this Safe-app.
