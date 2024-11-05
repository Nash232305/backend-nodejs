# Backend para Aplicación de Movimientos de sinpe

Este repositorio contiene la configuración del backend para una aplicación de movimientos financieros desarrollada con AWS Lambda, API Gateway y DynamoDB. El backend está diseñado para integrarse con una aplicación móvil hecha en React Native que permite a los usuarios gestionar sus movimientos financieros.

## Descripción General

El backend consiste en varias funciones Lambda que manejan operaciones CRUD para los movimientos de sinpe y el balance del usuario. Estas funciones se exponen a través de API Gateway, proporcionando endpoints que la aplicación móvil puede consumir.

### Arquitectura

1. **AWS Lambda**: Funciones sin servidor que ejecutan lógica específica del backend.
2. **API Gateway**: Interfaz HTTP que permite exponer las funciones Lambda como endpoints.
3. **DynamoDB**: Base de datos NoSQL de AWS que almacena los datos de los movimientos y del balance.

Cada endpoint está asociado con una función Lambda que realiza operaciones específicas en DynamoDB.

## Endpoints de la API

A continuación se describen los endpoints disponibles, sus métodos HTTP, y los datos esperados o devueltos.

### 1. Obtener el Balance

- **URL**: `https://z755adyvuc.execute-api.us-east-2.amazonaws.com/dev/balance`
- **Método**: `GET`
- **Descripción**: Recupera el balance actual del usuario.
- **Respuesta**:
  ```json
  {
    "balance": 100000
  }

### 2. Actualizar el Balance
- **URL**: https://z755adyvuc.execute-api.us-east-2.amazonaws.com/dev/balance
- **Método**: POST
- **Descripción**: Actualiza el balance del usuario después de realizar un movimiento.
- **Parámetros (en el cuerpo de la solicitud)**:
```json
Copy code
{
  "monto": 5000
}
Este monto se resta del balance actual.
```
- **Respuesta**:
- ```json
  {
    "balance": 95000
  }
  
###3. Obtener Detalles de un Movimiento
- **URL**: https://z755adyvuc.execute-api.us-east-2.amazonaws.com/dev/detallesMovimiento/{id}/{fecha}
- **Método**: GET
- **Descripción**: Obtiene los detalles de un movimiento específico usando el id y fecha.
- **Parámetros en la URL**
```
{id}: ID único del movimiento.
{fecha}: Fecha del movimiento en formato ISO.
```
- **Respuesta**:
```json
Copy code
{
  "nombreContacto": "Juan Perez",
  "numeroContacto": "+50612345678",
  "detalle": "Pago de servicios",
  "fecha": "2024-11-05T10:00:00Z",
  "monto": 50000,
  "tipoMovimiento": "SINPE"
}
```
### 4. Obtener Todos los Movimientos
- **URL**: https://z755adyvuc.execute-api.us-east-2.amazonaws.com/dev/movements
- **Método**: GET
- **Descripción**: Recupera todos los movimientos registrados en la base de datos.
- **Respuesta**:
```json
Copy code
[
  {
    "id": "1",
    "nombreContacto": "Juan Perez",
    "numeroContacto": "+50612345678",
    "detalle": "Pago de servicios",
    "fecha": "2024-11-05T10:00:00Z",
    "monto": 50000,
    "tipoMovimiento": "SINPE"
  },
  {
    "id": "2",
    "nombreContacto": "Carlos Naranjo",
    "numeroContacto": "+50698765432",
    "detalle": "Transferencia",
    "fecha": "2024-11-05T10:00:00Z",
    "monto": 20000,
    "tipoMovimiento": "SINPE"
  }
]
```

### 5. Agregar un Nuevo Movimiento
-- **URL**: https://z755adyvuc.execute-api.us-east-2.amazonaws.com/dev/movements
-- **Método**: POST
-- **Descripción**: Agrega un nuevo movimiento en la base de datos.
-- **Parámetros (en el cuerpo de la solicitud)**:
```json
Copy code
{
  "id": "3",
  "nombreContacto": "Maria Rojas",
  "numeroContacto": "+50611223344",
  "detalle": "Compra",
  "fecha": "2024-11-05T11:00:00Z",
  "monto": 15000,
  "tipoMovimiento": "SINPE"
}
```
- **Respuesta**:
```json
Copy code
{
  "message": "Movimiento agregado correctamente"
}
```

## Configuración y Despliegue

### 1. Configurar las Funciones Lambda

Para cada operación, se ha configurado una función Lambda específica que interactúa con DynamoDB. Las operaciones cubren las siguientes funcionalidades:

- **Obtener Balance**: Recupera el balance actual del usuario.
- **Actualizar Balance**: Modifica el balance del usuario tras realizar un movimiento.
- **Obtener Detalles de Movimiento**: Obtiene los detalles de un movimiento específico utilizando el `id` y la `fecha`.
- **Obtener Todos los Movimientos**: Recupera la lista completa de movimientos registrados.
- **Agregar Movimiento**: Inserta un nuevo movimiento en la base de datos.

Cada función Lambda debe tener los permisos necesarios para acceder a DynamoDB y realizar las operaciones de lectura y escritura correspondientes. Esto se configura en la política de permisos adjunta al rol de cada función Lambda.

### 2. Configuración de la Base de Datos en DynamoDB

Se han creado dos tablas en DynamoDB para gestionar la información:

#### MovimientosSinpe

- **Propósito**: Almacenar los detalles de cada movimiento financiero.
- **Esquema**:
  - **id**: Clave de partición (String).
  - **fecha**: Clave de ordenación (String).

#### UsuariosBalance

- **Propósito**: Almacenar el balance actual del usuario.
- **Esquema**:
  - **userId**: Clave de partición (String).
  - **balance**: Atributo adicional (Número) que representa el balance actual del usuario.

### 3. Configuración de API Gateway

Se ha creado un API Gateway para exponer las funciones Lambda como endpoints HTTP, de manera que puedan ser consumidos por la aplicación móvil.

- **Configuración de Endpoints**: Cada endpoint en el API Gateway está asociado a una función Lambda específica.
- **Métodos HTTP**: Cada endpoint utiliza el método HTTP (GET o POST) correspondiente a la operación deseada en la base de datos.
- **CORS**: CORS (Cross-Origin Resource Sharing) está habilitado en el API Gateway para permitir que la aplicación móvil, que puede estar en un dominio o puerto diferente, acceda a los endpoints sin problemas de seguridad.

### 4. Pruebas

Para verificar el correcto funcionamiento de cada endpoint, puedes utilizar herramientas como **Postman** o cualquier cliente HTTP. A continuación, algunos consejos para las pruebas:

- Asegúrate de seleccionar el **método HTTP** correcto (GET o POST) en función de la operación.
- Proporciona los **parámetros requeridos** en la URL o en el cuerpo de la solicitud, según lo necesite cada endpoint.
- Verifica las respuestas para asegurarte de que las funciones devuelven los datos esperados y manejan errores correctamente.

Estas pruebas te ayudarán a confirmar que las funciones Lambda están configuradas adecuadamente y que los endpoints de API Gateway funcionan como se espera.

