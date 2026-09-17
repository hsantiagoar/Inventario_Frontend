// =============================================================
// CONFIGURACIÓN DE LA API
// =============================================================

// Dirección del backend en Spring Boot (Railway)
const API_URL = "https://inventariobackend-production-23e3.up.railway.app/productos";

// Variable que guarda el ID del producto cuando estamos en modo edición
let idProductoEditando = null;


// =============================================================
// READ - CARGAR PRODUCTOS EN LA TABLA
// =============================================================

async function cargarProductos() {

    try {

        // Realizamos una petición GET al backend
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("Error al obtener los productos");
        }

        const productos = await respuesta.json();

        // Buscamos la tabla en el HTML
        const tabla = document.getElementById("tablaProductos");

        // Si la página actual no tiene tabla (ej: index.html o registrar.html), detenemos
        if (!tabla) {
            return;
        }

        // Limpiamos la tabla para no duplicar datos
        tabla.innerHTML = "";

        let totalInventario = 0;

        // Recorremos los productos que devolvió la base de datos
        productos.forEach(producto => {

            totalInventario += producto.precio * producto.cantidad;

            const stockMinimo =
                producto.stock_minimo ??
                producto.stockMinimo ??
                0;

            // Orden exacto de columnas: ID, Código, Nombre, Categoría, Proveedor, Precio, Cantidad, Stock Mínimo, Marca, Acciones
            tabla.innerHTML += `
                <tr>
                    <td>${producto.id}</td>
                    <td>${producto.codigo}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.categoria || 'N/A'}</td>
                    <td>${producto.proveedor || 'N/A'}</td>
                    <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>
                    <td>${producto.cantidad}</td>
                    <td>${stockMinimo}</td>
                    <td>${producto.marca || 'N/A'}</td>
                    <td>
                        <button
                            type="button"
                            class="btn btn-warning btn-sm mb-1"
                            onclick="editarProducto(${producto.id})">
                            <i class="fa-solid fa-pen"></i> Actualizar
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger btn-sm mb-1"
                            onclick="eliminarProducto(${producto.id})">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;

        });

        // Mostramos el valor total del inventario si el elemento existe
        const total = document.getElementById("totalInventario");
        if (total) {
            total.textContent = "$" + totalInventario.toLocaleString("es-CO");
        }

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }

}


// =============================================================
// POST - REGISTRAR PRODUCTO NUEVO
// =============================================================

const formProducto = document.getElementById("formProducto");

if (formProducto) {

    formProducto.addEventListener("submit", async function(event) {

        event.preventDefault();

        // Construimos el objeto con los datos del formulario
        const producto = {
            codigo: document.getElementById("codigo").value,
            nombre: document.getElementById("nombre").value,
            categoria: document.getElementById("categoria").value,
            proveedor: document.getElementById("proveedor").value,
            precio: parseFloat(document.getElementById("precio").value),
            cantidad: parseInt(document.getElementById("cantidad").value),
            stock_minimo: parseInt(document.getElementById("stock_minimo").value),
            marca: document.getElementById("marca") ? document.getElementById("marca").value : ""
        };

        // Si estamos editando, ejecutamos la actualización en vez de registrar uno nuevo
        if (idProductoEditando !== null) {
            await actualizarProducto();
            return;
        }

        try {

            const respuesta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(producto)
            });

            if (respuesta.ok) {
                alert("Producto registrado correctamente");
                formProducto.reset();
                cancelarEdicion();
                cargarProductos();

                if (window.location.pathname.includes("registrar.html")) {
                    window.location.href = "productos.html";
                }
            } else {
                alert("No fue posible registrar el producto");
            }

        } catch (error) {
            console.error("Error en la conexión:", error);
            alert("No se pudo conectar con el servidor backend");
        }

    });

}


// =============================================================
// CARGAR DATOS AL FORMULARIO PARA EDITAR
// =============================================================

async function editarProducto(id) {

    try {

        const respuesta = await fetch(`${API_URL}/${id}`);

        if (!respuesta.ok) {
            alert("No fue posible obtener el producto");
            return;
        }

        const producto = await respuesta.json();
        idProductoEditando = id;

        // Llenamos los inputs con la información actual del producto
        if (document.getElementById("codigo")) document.getElementById("codigo").value = producto.codigo || "";
        if (document.getElementById("nombre")) document.getElementById("nombre").value = producto.nombre || "";
        if (document.getElementById("categoria")) document.getElementById("categoria").value = producto.categoria || "";
        if (document.getElementById("proveedor")) document.getElementById("proveedor").value = producto.proveedor || "";
        if (document.getElementById("precio")) document.getElementById("precio").value = producto.precio || 0;
        if (document.getElementById("cantidad")) document.getElementById("cantidad").value = producto.cantidad || 0;
        if (document.getElementById("marca")) document.getElementById("marca").value = producto.marca || "";

        const stockMinimo = producto.stock_minimo ?? producto.stockMinimo ?? 0;
        if (document.getElementById("stock_minimo")) document.getElementById("stock_minimo").value = stockMinimo;

        // Cambiamos el texto del título y del botón
        const titulo = document.getElementById("formTitulo");
        if (titulo) {
            titulo.innerHTML = `<i class="fa-solid fa-pen-to-square me-2"></i> Actualizar Producto`;
        }

        const boton = document.getElementById("btnGuardar");
        if (boton) {
            boton.innerHTML = `<i class="fa-solid fa-pen me-1"></i> Actualizar Producto`;
        }

        if (formProducto) {
            formProducto.scrollIntoView({ behavior: "smooth" });
        }

    } catch (error) {
        console.error("Error al obtener producto:", error);
        alert("No se pudo obtener el producto");
    }

}


// =============================================================
// PUT - ACTUALIZAR PRODUCTO
// =============================================================

async function actualizarProducto() {

    try {

        const productoActualizado = {
            codigo: document.getElementById("codigo").value,
            nombre: document.getElementById("nombre").value,
            categoria: document.getElementById("categoria").value,
            proveedor: document.getElementById("proveedor").value,
            precio: parseFloat(document.getElementById("precio").value),
            cantidad: parseInt(document.getElementById("cantidad").value),
            stock_minimo: parseInt(document.getElementById("stock_minimo").value),
            marca: document.getElementById("marca") ? document.getElementById("marca").value : ""
        };

        const respuesta = await fetch(`${API_URL}/${idProductoEditando}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productoActualizado)
        });

        if (respuesta.ok) {
            alert("Producto actualizado correctamente");
            cancelarEdicion();
            cargarProductos();
        } else {
            alert("No fue posible actualizar el producto");
        }

    } catch (error) {
        console.error("Error al actualizar producto:", error);
        alert("No se pudo conectar con el servidor");
    }

}


// =============================================================
// DELETE - ELIMINAR PRODUCTO
// =============================================================

async function eliminarProducto(id) {

    const confirmar = confirm("¿Está seguro de que desea eliminar este producto?");
    if (!confirmar) return;

    try {

        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.ok) {
            alert("Producto eliminado correctamente");
            cargarProductos();
        } else {
            alert("No fue posible eliminar el producto");
        }

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("No se pudo conectar con el servidor");
    }

}


// =============================================================
// CANCELAR EDICIÓN / LIMPIAR FORMULARIO
// =============================================================

function cancelarEdicion() {

    if (formProducto) {
        formProducto.reset();
    }

    idProductoEditando = null;

    if (document.getElementById("marca")) {
        document.getElementById("marca").value = "";
    }

    const titulo = document.getElementById("formTitulo");
    if (titulo) {
        titulo.innerHTML = `<i class="fa-solid fa-pen-to-square me-2"></i> Registrar Producto`;
    }

    const boton = document.getElementById("btnGuardar");
    if (boton) {
        boton.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Guardar Producto`;
    }

}


// =============================================================
// BUSCAR PRODUCTO POR NOMBRE (GET /productos/buscar/{nombre})
// =============================================================

async function buscarProductoPorNombre() {
    const inputNombre = document.getElementById("buscarNombre");
    if (!inputNombre) return;

    const nombre = inputNombre.value.trim();

    if (!nombre) {
        alert("Por favor ingresa un nombre para buscar.");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/buscar/${encodeURIComponent(nombre)}`);

        if (!respuesta.ok) {
            alert(`No se encontraron productos con el nombre "${nombre}"`);
            return;
        }

        const productos = await respuesta.json();
        const tabla = document.getElementById("tablaProductos");
        if (!tabla) return;

        if (productos.length === 0) {
            alert(`No se encontraron productos con el nombre "${nombre}"`);
            return;
        }

        // Limpiamos y pintamos los resultados encontrados
        tabla.innerHTML = "";
        let totalInventario = 0;

        productos.forEach(producto => {
            totalInventario += producto.precio * producto.cantidad;
            const stockMinimo = producto.stock_minimo ?? producto.stockMinimo ?? 0;

            tabla.innerHTML += `
                <tr>
                    <td>${producto.id}</td>
                    <td>${producto.codigo}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.categoria || 'N/A'}</td>
                    <td>${producto.proveedor || 'N/A'}</td>
                    <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>
                    <td>${producto.cantidad}</td>
                    <td>${stockMinimo}</td>
                    <td>${producto.marca || 'N/A'}</td>
                    <td>
                        <button type="button" class="btn btn-warning btn-sm mb-1" onclick="editarProducto(${producto.id})">
                            <i class="fa-solid fa-pen"></i> Actualizar
                        </button>
                        <button type="button" class="btn btn-danger btn-sm mb-1" onclick="eliminarProducto(${producto.id})">
                            <i class="fa-solid fa-trash"></i> Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        const total = document.getElementById("totalInventario");
        if (total) {
            total.textContent = "$" + totalInventario.toLocaleString("es-CO");
        }

    } catch (error) {
        console.error("Error al buscar producto por nombre:", error);
        alert("Ocurrió un error al consultar el producto.");
    }
}


// =============================================================
// LIMPIAR BÚSQUEDA / VER TODOS
// =============================================================

function limpiarBusqueda() {
    const inputNombre = document.getElementById("buscarNombre");
    if (inputNombre) inputNombre.value = "";
    cargarProductos();
}


// =============================================================
// CONTADOR DE PRODUCTOS PARA LA PÁGINA PRINCIPAL (index.html)
// =============================================================

document.addEventListener("DOMContentLoaded", async function () {
    const contenedorTotalIndex = document.getElementById("totalProductosIndex");
    
    // Solo se ejecuta si estamos en index.html
    if (contenedorTotalIndex) {
        try {
            const respuesta = await fetch(API_URL);
            if (respuesta.ok) {
                const productos = await respuesta.json();
                contenedorTotalIndex.textContent = productos.length;
            } else {
                contenedorTotalIndex.textContent = "0";
            }
        } catch (error) {
            console.error("Error al obtener el total de productos en index:", error);
            contenedorTotalIndex.textContent = "0";
        }
    }
});


// =============================================================
// INICIAR CARGA DE PRODUCTOS
// =============================================================

cargarProductos();