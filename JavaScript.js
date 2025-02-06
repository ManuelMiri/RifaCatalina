document.addEventListener("DOMContentLoaded", function () {
    const numberContainer = document.querySelector('.d-flex');
    const reservedList = document.querySelector('#reserved-list');
    const SECURITY_CODE = "1234"; // Código de seguridad
    let rifaData = JSON.parse(localStorage.getItem("rifa")) || {}; // Cargar datos guardados

    // Función para actualizar la lista de números adjudicados dentro del menú desplegable
    function actualizarLista() {
        reservedList.innerHTML = ""; // Limpiar lista
        Object.values(rifaData).forEach((data) => {
            const listItem = document.createElement("li");
            listItem.textContent = `Número ${data.numero} - ${data.nombre} ${data.apellido}`;
            reservedList.appendChild(listItem);
        });
    }

    // Crear botones del 1 al 100
    for (let i = 1; i <= 100; i++) {
        const button = document.createElement("button");
        button.className = rifaData[i] ? "btn btn-danger number-button" : "btn btn-outline-primary number-button";
        button.textContent = i;
        button.dataset.numero = i;

        // Evento al hacer clic en un número
        button.onclick = function () {
            Swal.fire({
                title: "Código de seguridad",
                input: "password",
                inputLabel: "Ingresa el código de seguridad:",
                inputPlaceholder: "Introduce el código",
                inputAttributes: { maxlength: 10, autocapitalize: "off", autocorrect: "off" },
                confirmButtonText: "Validar",
                preConfirm: (code) => {
                    if (code !== SECURITY_CODE) {
                        Swal.showValidationMessage("Código incorrecto");
                    } else {
                        return true;
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    if (rifaData[i]) {
                        // Si el número está ocupado, confirmar si se quiere liberar
                        Swal.fire({
                            title: `Liberar número ${i}`,
                            text: "Este número ya está ocupado. ¿Quieres liberarlo?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Sí, liberar",
                            cancelButtonText: "Cancelar"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                delete rifaData[i]; // Eliminar del almacenamiento
                                localStorage.setItem("rifa", JSON.stringify(rifaData));

                                // Cambiar el color del botón a azul (disponible)
                                button.classList.remove("btn-danger");
                                button.classList.add("btn-outline-primary");

                                Swal.fire("Liberado", `El número ${i} está disponible nuevamente.`, "success");

                                // Actualizar lista
                                actualizarLista();
                            }
                        });
                    } else {
                        // Si el número está disponible, permitir reservarlo
                        Swal.fire({
                            title: `Reservar número ${i}`,
                            html: `
                                <input type="text" id="nombre" class="swal2-input" placeholder="Nombre">
                                <input type="text" id="apellido" class="swal2-input" placeholder="Apellido">
                            `,
                            confirmButtonText: "Guardar",
                            preConfirm: () => {
                                const nombre = Swal.getPopup().querySelector("#nombre").value;
                                const apellido = Swal.getPopup().querySelector("#apellido").value;

                                if (!nombre || !apellido) {
                                    Swal.showValidationMessage("Por favor, ingresa tu nombre y apellido");
                                }

                                return { nombre, apellido };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Guardar en LocalStorage
                                rifaData[i] = {
                                    numero: i,
                                    nombre: result.value.nombre,
                                    apellido: result.value.apellido
                                };
                                localStorage.setItem("rifa", JSON.stringify(rifaData));

                                Swal.fire("Éxito", "Número reservado correctamente", "success");

                                // Cambiar color del botón a rojo (ocupado)
                                button.classList.remove("btn-outline-primary");
                                button.classList.add("btn-danger");

                                // Actualizar lista en pantalla
                                actualizarLista();
                            }
                        });
                    }
                }
            });
        };

        numberContainer.appendChild(button);
    }

    // Cargar lista de números ocupados al iniciar
    actualizarLista();
});
