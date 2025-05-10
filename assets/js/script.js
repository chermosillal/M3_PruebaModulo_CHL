//para una mejora de visualizacion le vamos a formatear el input del monto se vea con separadores de miles con punto
document.addEventListener("DOMContentLoaded", function () {
    const montoInput = document.querySelector("#monto");
    montoInput.addEventListener("input", function (e) {
        let valor = e.target.value.replace(/\D/g, ""); // Eliminar caracteres no numéricos
        e.target.value = "$ " + formatearMiles(valor); // Anteponemos el signo "$"
    });
});
function formatearMiles(numero) {
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
//-----------------------------------------------------

//ahora obtenemos los registros de la API y calculamos la conversion y obtenemos los datos para el grafico
const obtenerUltimosValores = async () => {
    const monedaSeleccionada = document.querySelector("#moneda").value;
    // debemos revertir el formateo de los miles para el calculo
    const montoIngresado = document.querySelector("#monto").value.replace(/\./g, "").replace("$", "");
        if (monedaSeleccionada != 'Seleccione Moneda' & montoIngresado != 0 ){ //verificamos que haya seleccionado una moneda e ingresado el monto
        try {
            const salida = await fetch(`https://mindicador.cl/api/${monedaSeleccionada}`)
            const data = await salida.json()

            if (data.serie) {
                document.querySelector(".grafico").style.display = "flex";// cambiamos el diaplay para que se muestre el div del grafico
                //tomamos los ultimos 10 registros
                const ultimos10 = data.serie.slice(0, 10).reverse() 
                const fechas = ultimos10.map(item => new Date(item.fecha).toLocaleDateString())
                const valores = ultimos10.map(item => item.valor)
                const ultimoValor = ultimos10[ultimos10.length - 1].valor

                // Mostramos la conversión, cambiamos el separador de decimales por coma
                let res = document.querySelector("#resultado");
                res.innerHTML = `${formatearMiles((montoIngresado / ultimoValor).toFixed(2).replace(".", ","))} ${monedaSeleccionada}`.toUpperCase();

                // Restablecer el canvas
                resetCanvas();

                // Graficar los últimos valores
                dibujarGrafico(fechas, valores, monedaSeleccionada)
            } else {
                console.error("No se encontraron datos.")
                alert("¿Ingreso el monto y el tipo de moneda?")
            }
            } catch (error) {
                console.error("Error al obtener datos:", error)
                alert("Error al obtener datos")
            }
        }else {
            console.error("No se ingreso el monto o la moneda")
            alert("¿Ingreso el monto y el tipo de moneda?")
        }
    }

// Función para resetear el canvas
const resetCanvas = () => {
    const canvasContainer = document.querySelector(".grafico");
    canvasContainer.innerHTML = '<canvas id="grafico"></canvas>'; // Reemplaza el canvas para evitar gráficos infinitos
};

// Función para dibujar el gráfico
const dibujarGrafico = (labels, data, moneda) => {
    const ctx = document.querySelector("#grafico").getContext("2d");
    let miGrafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: `Valor de ${moneda} en los últimos 10 Registros`,
                data: data,
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: Math.min(...data) * 0.95,
                    max: Math.max(...data) * 1.05
                }
            }
        }
    });
};
