# Manual de Cajera — Portal Romerelli

Este manual describe como emitir guias de despacho desde el portal web de Romerelli. No se requieren conocimientos tecnicos.

## 1. Ingreso al portal

1. Abrir el navegador (Chrome o Edge) e ir a `https://romerelli.giraffos.com`.
2. Ingresar usuario y contrasena entregados por el administrador.
3. Presionar **Iniciar sesion**.
4. Si la contrasena fue olvidada, contactar a TI Romerelli. El portal no tiene auto-recuperacion.

> **Tip:** Mantener la sesion iniciada solo en el computador de caja. Nunca compartir credenciales.

## 2. Tipos de guia disponibles

| Tipo | Cuando se usa |
|---|---|
| **Despacho** | Venta a cliente nacional. |
| **Traslado** | Movimiento interno entre bodegas o sucursales de Romerelli. |
| **Exportacion** | Carga que va asociada a un embarque (contenedor) creado previamente por admin.comex. |

## 3. Crear una Guia de Despacho (nacional)

1. En el menu lateral, presionar **Nueva Guia**.
2. Seleccionar tipo **Despacho**.
3. Elegir el **Cliente** desde el buscador (escribir al menos 3 letras).
4. Completar los campos de transporte:
   - Patente del camion
   - Nombre del chofer
   - Peso en kilogramos
   - Tipo de material (desde la lista)
   - Numero de ticket de romana (campo **Referencia**)
5. Agregar los productos con cantidad y unidad de medida.
6. Presionar **Guardar y validar**.
7. Descargar el PDF con el boton **Descargar Guia**.

## 4. Crear una Guia de Traslado

1. Presionar **Nueva Guia** y seleccionar tipo **Traslado**.
2. Seleccionar bodega de origen y bodega de destino.
3. Completar datos de transporte (patente, chofer, peso).
4. Agregar el detalle de productos.
5. Presionar **Guardar y validar** y luego **Descargar Guia**.

> **Importante:** En traslados no se asigna cliente. Si el sistema lo exige, seleccionar "Romerelli SpA" como contraparte.

## 5. Crear una Guia de Exportacion (asociada a embarque)

1. Presionar **Nueva Guia** y seleccionar tipo **Exportacion**.
2. En el campo **Embarque**, elegir el embarque creado previamente por admin.comex. Si no aparece, avisar a admin.comex.
3. Seleccionar el **Contenedor** correspondiente dentro del embarque.
4. Completar los datos de transporte y peso.
5. Agregar el detalle del material cargado al contenedor.
6. Presionar **Guardar y validar**.
7. Descargar el PDF con **Descargar Guia**.

> **Nota:** Un embarque tiene un limite de contenedores. Si el sistema indica que el embarque esta lleno, contactar a admin.comex antes de continuar.

## 6. Descargar e imprimir PDFs

1. En el listado **Mis Guias**, buscar la guia por numero o fecha.
2. Presionar el icono de PDF al costado derecho.
3. El archivo se descarga en la carpeta **Descargas** del computador.
4. Imprimir en la impresora de caja (3 copias: original cliente, copia SII, copia Romerelli).

## 7. Errores frecuentes

| Mensaje | Que hacer |
|---|---|
| "Cliente requerido" | Volver y seleccionar cliente desde el buscador. |
| "Embarque lleno" | Avisar a admin.comex para ampliar limite. |
| "Sesion expirada" | Volver a iniciar sesion. |
| "Error al validar" | Anotar el numero de guia y avisar a TI Romerelli. |
