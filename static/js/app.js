// =============================================================
// CONFIGURACIÓN DE LA API
// =============================================================

// Dirección del backend de Spring Boot
const API_URL = "https://inventariobackend-production-23e3.up.railway.app/productos";


// Variable que guarda el ID del producto que estamos editando
let idProductoEditando = null;


// =============================================================
// READ - CARGAR PRODUCTOS
// =============================================================

async function cargarProductos() {

    try {

        // Realizamos una petición GET al backend
        const respuesta = await fetch(API_URL);

        // Verificamos si la respuesta fue correcta
        if (!respuesta.ok) {
            throw new Error("Error al obtener los productos");
        }

        // Convertimos la respuesta a JSON
        const productos = await respuesta.json();


        // Buscamos la tabla
        const tabla = document.getElementById("tablaProductos");


        // Si no existe la tabla, detenemos la función
        if (!tabla) {
            return;
        }


        // =====================================================
        // LIMPIAR TABLA
        // =====================================================
        tabla.innerHTML = "";


        // Variable para calcular el valor total
        let totalInventario = 0;


        // =====================================================
        // RECORRER PRODUCTOS
        // =====================================================

        productos.forEach(producto => {

            // Calculamos el valor del inventario
            totalInventario += producto.precio * producto.cantidad;


            // =================================================
            // STOCK MÍNIMO
            // =================================================
            const stockMinimo =
                producto.stock_minimo ??
                producto.stockMinimo ??
                0;


            // =================================================
            // AGREGAR PRODUCTO A LA TABLA (ORDEN CORREGIDO)
            // =================================================
            tabla.innerHTML += `
                <tr>

                    <!-- 1. ID -->
                    <td>${producto.id}</td>

                    <!-- 2. Código -->
                    <td>${producto.codigo}</td>

                    <!-- 3. Nombre -->
                    <td>${producto.nombre}</td>

                    <!-- 4. Categoría -->
                    <td>${producto.categoria || 'N/A'}</td>

                    <!-- 5. Proveedor -->
                    <td>${producto.proveedor || 'N/A'}</td>

                    <!-- 6. Precio -->
                    <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>

                    <!-- 7. Cantidad -->
                    <td>${producto.cantidad}</td>

                    <!-- 8. Stock mínimo -->
                    <td>${stockMinimo}</td>

                    <!-- 9. Marca -->
                    <td>${producto.marca || 'N/A'}</td>

                    <!-- 10. Acciones -->
                    <td>
                        <!-- Botón actualizar -->
                        <button
                            type="button"
                            class="btn btn-warning btn-sm mb-1"
                            onclick="editarProducto(${producto.id})">
                            <i class="fa-solid fa-pen"></i> Actualizar
                        </button>

                        <!-- Botón eliminar -->
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


        // =====================================================
        // MOSTRAR VALOR TOTAL DEL INVENTARIO
        // =====================================================
        const total = document.getElementById("totalInventario");
        if (total) {
            total.textContent = "$" + totalInventario.toLocaleString("es-CO");
        }


    } catch (error) {
        console.error("Error al cargar productos:", error);
    }

}


// =============================================================
// POST - REGISTRAR PRODUCTO
// =============================================================

const formProducto = document.getElementById("formProducto");

if (formProducto) {

    formProducto.addEventListener("submit", async function(event) {

        // Evitamos que el formulario recargue la página
        event.preventDefault();

        // =================================================
        // OBTENER DATOS DEL FORMULARIO
        // =================================================
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

        // =================================================
        // SI HAY UN ID, ESTAMOS ACTUALIZANDO
        // =================================================
        if (idProductoEditando !== null) {
            await actualizarProducto();
            return;
        }

        // =================================================
        // REGISTRAR PRODUCTO
        // =================================================
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
// EDITAR PRODUCTO
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

        // =====================================================
        // CARGAR DATOS EN EL FORMULARIO
        // =====================================================
        if (document.getElementById("codigo")) document.getElementById("codigo").value = producto.codigo || "";
        if (document.getElementById("nombre")) document.getElementById("nombre").value = producto.nombre || "";
        if (document.getElementById("categoria")) document.getElementById("categoria").value = producto.categoria || "";
        if (document.getElementById("proveedor")) document.getElementById("proveedor").value = producto.proveedor || "";
        if (document.getElementById("precio")) document.getElementById("precio").value = producto.precio || 0;
        if (document.getElementById("cantidad")) document.getElementById("cantidad").value = producto.cantidad || 0;
        if (document.getElementById("marca")) document.getElementById("marca").value = producto.marca || "";

        const stockMinimo = producto.stock_minimo ?? producto.stockMinimo ?? 0;
        if (document.getElementById("stock_minimo")) document.getElementById("stock_minimo").value = stockMinimo;

        // =====================================================
        // CAMBIAR TÍTULO Y BOTÓN
        // =====================================================
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
// BUSCAR PRODUCTO POR ID (GET /productos/{id})
// =============================================================

async function buscarProductoPorId() {
    const inputNombre = document.getElementById("buscarNombre");
    if (!inputNombre) return;

    const nombre = inputNombre.value.trim();

    if (!nombre) {
        alert("Por favor ingresa un nombre para buscar.");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${nombre}`);

        if (!respuesta.ok) {
            alert(`No se encontró ningún producto con el nombre ${nombre}`);
            return;
        }

        const producto = await respuesta.json();
        const tabla = document.getElementByNombre("tablaProductos");
        if (!tabla) return;

        if (!producto || !producto.nombre) {
            alert(`No se encontró ningún producto con el nombre ${nombre}`);
            return;
        }

        const stockMinimo = producto.stock_minimo ?? producto.stockMinimo ?? 0;

        tabla.innerHTML = `
            <tr>
                <!-- 1. ID -->
                <td>${producto.id}</td>

                <!-- 2. Código -->
                <td>${producto.codigo}</td>

                <!-- 3. Nombre -->
                <td>${producto.nombre}</td>

                <!-- 4. Categoría -->
                <td>${producto.categoria || 'N/A'}</td>

                <!-- 5. Proveedor -->
                <td>${producto.proveedor || 'N/A'}</td>

                <!-- 6. Precio -->
                <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>

                <!-- 7. Cantidad -->
                <td>${producto.cantidad}</td>

                <!-- 8. Stock mínimo -->
                <td>${stockMinimo}</td>

                <!-- 9. Marca -->
                <td>${producto.marca || 'N/A'}</td>

                <!-- 10. Acciones -->
                <td>
                    <button class="btn btn-warning btn-sm mb-1" onclick="editarProducto(${producto.id})">
                        <i class="fa-solid fa-pen"></i> Actualizar
                    </button>
                    <button class="btn btn-danger btn-sm mb-1" onclick="eliminarProducto(${producto.id})">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    } catch (error) {
        console.error("Error al buscar producto:", error);
        alert("Ocurrió un error al consultar el producto.");
    }
}

function limpiarBusqueda() {
    const inputId = document.getElementById("buscarId");
    if (inputId) inputId.value = "";
    cargarProductos();
}

// =============================================================
// INICIAR CARGA DE PRODUCTOS
// =============================================================
cargarProductos();