## Clonacion del proyecto

Abre la carpeta donde desea clonar el proyecto y ejecuta este comando en un cmd

```bash
$ git clone https://github.com/Yurgen2007/vodkoffe_Backend.git
```
luego de clonarlo le aparecera una carpeta "Backendnestjs" abrala con un click o en la terminal con cd + tabulador

## Creamos el .env
Puede utiliza este 
```bash
$ DB_PASSWORD=123
$ DB_NAME=vodkoffe_db
$ DB_HOST=localhost
$ DB_PORT=5432
$ DB_USERNAME=postgres

#URL básica
$ BASE_URL='http://localhost:5173'



# JWT
$ SECRET='Secret'
```

## Instalacion de dependencias 

Luego de esto pasamos a ejecutar este comando para que se descarguen todas las dependencias necesarias 

```bash
$ npm install
```

Despues pasamos a poblar la base de datos por medio de un seeder con el siguiente comando 

```bash
$ npm run seed
```

## Compile y corra el proyecto

```bash
$ npm run start:dev
```
