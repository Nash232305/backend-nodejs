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
  
