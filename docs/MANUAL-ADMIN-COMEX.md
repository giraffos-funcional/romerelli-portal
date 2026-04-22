# Manual Admin Comex — Embarques de Exportacion

Este manual describe como crear y administrar embarques de exportacion en el portal Romerelli. Esta dirigido al rol **admin.comex**.

## 1. Ingreso al portal

1. Abrir `https://romerelli.giraffos.com`.
2. Iniciar sesion con el usuario admin.comex.
3. En el menu, seleccionar **Embarques**.

## 2. Crear un nuevo embarque

1. Presionar **Nuevo Embarque**.
2. Completar la cabecera:

| Campo | Descripcion |
|---|---|
| **DUS** | Numero de Documento Unico de Salida (aduana). |
| **Despacho** | Numero de despacho asignado por la agencia. |
| **Booking** | Numero de reserva con la naviera. |
| **Orden de venta** | Orden de venta Odoo asociada. |
| **Agencia de aduana** | Seleccionar desde la lista. |
| **Limite de contenedores** | Cantidad maxima de contenedores permitidos. |

3. Presionar **Guardar**. El embarque queda en estado **Borrador**.
4. Cuando toda la informacion este confirmada, presionar **Confirmar Embarque**. A partir de ese momento las cajeras podran asociar guias.

> **Importante:** El **limite de contenedores** evita que las cajeras sobrecarguen el embarque. Ajustar con cuidado: aumentar es facil, disminuir requiere eliminar contenedores existentes.

## 3. Consultar embarques

1. En el menu, entrar a **Embarques**.
2. Usar los filtros disponibles: por estado, DUS, booking o rango de fechas.
3. Presionar cualquier embarque para ver:
   - Datos generales (DUS, booking, agencia)
   - Listado de contenedores (numero, sello, pesos)
   - Guias de despacho asociadas a cada contenedor

## 4. Flujo con cajeras

Una vez confirmado el embarque:

1. Admin.comex informa a cajeras el **numero de embarque** y los **numeros de contenedor** que llegaran.
2. Cuando el camion llega con un contenedor, la cajera crea una **Guia de Exportacion** (ver MANUAL-CAJERA.md seccion 5) y selecciona:
   - El embarque indicado por admin.comex
   - El contenedor que corresponde
3. La cajera llena sello, peso neto, tara y peso total.
4. El sistema valida automaticamente que no se exceda el **limite de contenedores** del embarque.

## 5. Cerrar embarque

1. Cuando todos los contenedores esten cargados y validados, entrar al embarque.
2. Presionar **Cerrar Embarque**. A partir de este momento no se pueden agregar mas guias.
3. Descargar el PDF resumen con **Imprimir Embarque** para la agencia de aduana.

## 6. Errores frecuentes

| Mensaje | Causa / Solucion |
|---|---|
| "Limite alcanzado" | Aumentar el limite o revisar si hay contenedores duplicados. |
| "Embarque cerrado" | No se puede modificar. Reabrir solo con autorizacion de gerencia. |
| "DUS duplicado" | El numero de DUS ya existe en otro embarque. Verificar antes de crear. |

> **Nota:** Todo cambio sobre un embarque ya confirmado queda registrado en el log de Odoo. No borrar informacion sin respaldar.
