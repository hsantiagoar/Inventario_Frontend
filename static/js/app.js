// =============================================================
// CONFIGURACIÓN DE LA API
// =============================================================

// Dirección del backend de Spring Boot
const API_URL = "http://localhost:8081/productos";


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

        // Esto es MUY IMPORTANTE.
        // Evita que los productos se repitan.
        tabla.innerHTML = "";


        // Variable para calcular el valor total
        let totalInventario = 0;


        // =====================================================
        // RECORRER PRODUCTOS
        // =====================================================

        productos.forEach(producto => {

            // Calculamos el valor del inventario
            // Precio × cantidad
            totalInventario +=
                producto.precio * producto.cantidad;


            // =================================================
            // STOCK MÍNIMO
            // =================================================

            // Si Java devuelve stock_minimo usamos ese.
            // Si devuelve stockMinimo usamos ese.
            const stockMinimo =
                producto.stock_minimo ??
                producto.stockMinimo ??
                0;


            // =================================================
            // AGREGAR PRODUCTO A LA TABLA
            // =================================================

            tabla.innerHTML += `
                <tr>

                    <!-- ID -->
                    <td>
                        ${producto.id}
                    </td>


                    <!-- Código -->
                    <td>
                        ${producto.codigo}
                    </td>


                    <!-- Nombre -->
                    <td>
                        ${producto.nombre}
                    </td>


                    <!-- Categoría -->
                    <td>
                        ${producto.categoria}
                    </td>


                    <!-- Proveedor -->
                    <td>
                        ${producto.proveedor}
                    </td>


                    <!-- Precio -->
                    <td>
                        $${Number(producto.precio)
                            .toLocaleString("es-CO")}
                    </td>


                    <!-- Cantidad -->
                    <td>
                        ${producto.cantidad}
                    </td>


                    <!-- Stock mínimo -->
                    <td>
                        ${stockMinimo}
                    </td>


                    <!-- Acciones -->
                    <td>

                        <!-- Botón actualizar -->
                        <button
                            type="button"
                            class="btn btn-warning btn-sm mb-1"
                            onclick="editarProducto(${producto.id})">

                            <i class="fa-solid fa-pen"></i>

                            Actualizar

                        </button>


                        <!-- Botón eliminar -->
                        <button
                            type="button"
                            class="btn btn-danger btn-sm mb-1"
                            onclick="eliminarProducto(${producto.id})">

                            <i class="fa-solid fa-trash"></i>

                            Eliminar

                        </button>

                    </td>

                </tr>
            `;

        });


        // =====================================================
        // MOSTRAR VALOR TOTAL DEL INVENTARIO
        // =====================================================

        const total =
            document.getElementById("totalInventario");


        if (total) {

            total.textContent =
                "$" + totalInventario.toLocaleString("es-CO");

        }


    } catch (error) {

        console.error(
            "Error al cargar productos:",
            error
        );

    }

}


// =============================================================
// POST - REGISTRAR PRODUCTO
// =============================================================

const formProducto =
    document.getElementById("formProducto");


if (formProducto) {

    formProducto.addEventListener(
        "submit",
        async function(event) {

            // Evitamos que el formulario recargue la página
            event.preventDefault();


            // =================================================
            // OBTENER DATOS DEL FORMULARIO
            // =================================================

            const producto = {

                codigo:
                    document.getElementById("codigo").value,

                nombre:
                    document.getElementById("nombre").value,

                categoria:
                    document.getElementById("categoria").value,

                proveedor:
                    document.getElementById("proveedor").value,

                precio:
                    parseFloat(
                        document.getElementById("precio").value
                    ),

                cantidad:
                    parseInt(
                        document.getElementById("cantidad").value
                    ),

                stock_minimo:
                    parseInt(
                        document.getElementById("stock_minimo").value
                    )
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

                const respuesta =
                    await fetch(API_URL, {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(producto)

                    });


                if (respuesta.ok) {

                    alert(
                        "Producto registrado correctamente"
                    );


                    // Limpiamos formulario
                    formProducto.reset();


                    // Volvemos a cargar la tabla
                    cargarProductos();


                    // Si estamos en registrar.html
                    // vamos a productos.html
                    if (
                        window.location.pathname
                            .includes("registrar.html")
                    ) {

                        window.location.href =
                            "productos.html";

                    }


                } else {

                    alert(
                        "No fue posible registrar el producto"
                    );

                }


            } catch (error) {

                console.error(
                    "Error en la conexión:",
                    error
                );


                alert(
                    "No se pudo conectar con el servidor backend"
                );

            }

        }
    );

}


// =============================================================
// EDITAR PRODUCTO
// =============================================================

async function editarProducto(id) {

    try {

        // Buscamos el producto por ID
        const respuesta =
            await fetch(`${API_URL}/${id}`);


        if (!respuesta.ok) {

            alert(
                "No fue posible obtener el producto"
            );

            return;
        }


        // Convertimos a JSON
        const producto =
            await respuesta.json();


        // Guardamos el ID que estamos editando
        idProductoEditando = id;


        // =====================================================
        // CARGAR DATOS EN EL FORMULARIO
        // =====================================================

        document.getElementById("codigo").value =
            producto.codigo;

        document.getElementById("nombre").value =
            producto.nombre;

        document.getElementById("categoria").value =
            producto.categoria;

        document.getElementById("proveedor").value =
            producto.proveedor;

        document.getElementById("precio").value =
            producto.precio;

        document.getElementById("cantidad").value =
            producto.cantidad;


        // Stock mínimo
        const stockMinimo =
            producto.stock_minimo ??
            producto.stockMinimo ??
            0;

        document.getElementById("stock_minimo").value =
            stockMinimo;


        // =====================================================
        // CAMBIAR TÍTULO Y BOTÓN
        // =====================================================

        const titulo =
            document.getElementById("formTitulo");

        if (titulo) {

            titulo.innerHTML =
                `<i class="fa-solid fa-pen-to-square me-2"></i>
                 Actualizar Producto`;

        }


        const boton =
            document.getElementById("btnGuardar");

        if (boton) {

            boton.innerHTML =
                `<i class="fa-solid fa-pen me-1"></i>
                 Actualizar Producto`;

        }


        // Subimos hasta el formulario
        formProducto.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Error al obtener producto:",
            error
        );

        alert(
            "No se pudo obtener el producto"
        );

    }

}


// =============================================================
// PUT - ACTUALIZAR PRODUCTO
// =============================================================

async function actualizarProducto() {

    try {

        // Obtenemos los datos actuales del formulario
        const productoActualizado = {

            codigo:
                document.getElementById("codigo").value,

            nombre:
                document.getElementById("nombre").value,

            categoria:
                document.getElementById("categoria").value,

            proveedor:
                document.getElementById("proveedor").value,

            precio:
                parseFloat(
                    document.getElementById("precio").value
                ),

            cantidad:
                parseInt(
                    document.getElementById("cantidad").value
                ),

            stock_minimo:
                parseInt(
                    document.getElementById("stock_minimo").value
                )

        };


        // Enviamos los cambios al backend
        const respuesta =
            await fetch(
                `${API_URL}/${idProductoEditando}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            productoActualizado
                        )

                }
            );


        if (respuesta.ok) {

            alert(
                "Producto actualizado correctamente"
            );


            // Limpiamos el formulario
            cancelarEdicion();


            // Recargamos la tabla
            cargarProductos();


        } else {

            alert(
                "No fue posible actualizar el producto"
            );

        }


    } catch (error) {

        console.error(
            "Error al actualizar producto:",
            error
        );


        alert(
            "No se pudo conectar con el servidor"
        );

    }

}


// =============================================================
// DELETE - ELIMINAR PRODUCTO
// =============================================================

async function eliminarProducto(id) {

    // Confirmación antes de eliminar
    const confirmar =
        confirm(
            "¿Está seguro de que desea eliminar este producto?"
        );


    // Si el usuario cancela
    if (!confirmar) {
        return;
    }


    try {

        // Enviamos petición DELETE
        const respuesta =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (respuesta.ok) {

            alert(
                "Producto eliminado correctamente"
            );


            // Actualizamos la tabla
            cargarProductos();


        } else {

            alert(
                "No fue posible eliminar el producto"
            );

        }


    } catch (error) {

        console.error(
            "Error al eliminar producto:",
            error
        );


        alert(
            "No se pudo conectar con el servidor"
        );

    }

}


// =============================================================
// CANCELAR EDICIÓN / LIMPIAR FORMULARIO
// =============================================================

function cancelarEdicion() {

    // Reiniciamos el formulario
    if (formProducto) {

        formProducto.reset();

    }


    // Quitamos el ID de edición
    idProductoEditando = null;


    // Restauramos el título
    const titulo =
        document.getElementById("formTitulo");


    if (titulo) {

        titulo.innerHTML =
            `<i class="fa-solid fa-pen-to-square me-2"></i>
             Registrar Producto`;

    }


    // Restauramos el botón
    const boton =
        document.getElementById("btnGuardar");


    if (boton) {

        boton.innerHTML =
            `<i class="fa-solid fa-floppy-disk me-1"></i>
             Guardar Producto`;

    }

}


// =============================================================
// INICIAR CARGA DE PRODUCTOS
// =============================================================

cargarProductos();

// =========================================================================
// BUSCAR PRODUCTO POR ID (GET /productos/{id})
// =========================================================================
async function buscarProductoPorId() {
    const inputId = document.getElementById("buscarId");
    const id = inputId.value.trim();

    if (!id) {
        alert("Por favor ingresa un ID para buscar.");
        return;
    }

    try {
        // Hace la petición al endpoint con PathVariable de Spring Boot
        const respuesta = await fetch(`${API_URL}/${id}`);

        if (!respuesta.ok) {
            alert(`No se encontró ningún producto con el ID ${id}`);
            return;
        }

        const producto = await respuesta.json();
        const tabla = document.getElementById("tablaProductos");
        if (!tabla) return;

        // Si el endpoint devuelve null o un objeto vacío
        if (!producto || !producto.id) {
            alert(`No se encontró ningún producto con el ID ${id}`);
            return;
        }

        // Renderiza únicamente el producto encontrado en la tabla
        tabla.innerHTML = `
            <tr>
                <td>${producto.id}</td>
                <td class="fw-bold">${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td><span class="badge bg-secondary">${producto.categoria || 'N/A'}</span></td>
                <td class="text-success fw-bold">$${Number(producto.precio).toLocaleString()}</td>
                <td class="text-center">
                    <span class="badge ${producto.cantidad > 5 ? 'bg-success' : (producto.cantidad > 0 ? 'bg-warning text-dark' : 'bg-danger')}">
                        ${producto.cantidad}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-warning btn-sm me-1" onclick="iniciarEdicion(${producto.id})">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id}, '${producto.codigo}')">
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
    cargarProductos(); // Vuelve a listar todos los productos de MySQL
}