let mymap;
let markerLayer = L.layerGroup();

const getCountryCoordinates = async (countryName) => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const country = data[0];
            const latitude = country.latlng[0];
            const longitude = country.latlng[1];

            return { latitude, longitude };
        } else {
            document.getElementById("mapid").innerHTML = "";
            document.getElementById("mapid").innerHTML = `<h2>No se encontraron coordenadas para el país: ${countryName}</h2>`;
        }
    } catch (error) {
        console.error('Error al obtener datos de REST Countries API:', error);
        return;
    }
}

const getResultModel = async (dataAPI) => {
    try {
        const response = await fetch(`./api/modeloAnalisis`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataAPI)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener datos de REST Countries API:', error);
        return;
    }
}

const handleOptionChange = () => {
    const optionTime = document.getElementById("optionTime");
    const yearField = document.getElementById("yearField");
    const seasonField = document.getElementById("seasonField");
    const monthField = document.getElementById("monthField");

    seasonField.style.display = "none";
    monthField.style.display = "none";

    if (optionTime.value === "1") {

        yearField.style.display = "block";

    } else if (optionTime.value === "2") {

        seasonField.style.display = "block";
        yearField.style.display = "block";

    } else if (optionTime.value === "3" || optionTime.value === "4") {

        monthField.style.display = "block";
        yearField.style.display = "block";

    } else if (optionTime.value === "0") {

        yearField.style.display = "none";
        seasonField.style.display = "none";
        monthField.style.display = "none";

    }
};

document.addEventListener('DOMContentLoaded', () => {
    handleOptionChange();
});

document.getElementById("myForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    let depth = parseInt(document.getElementById("depth").value, 10) || 0;
    let optionTime = parseInt(document.getElementById("optionTime").value, 10) || 0;
    let year = parseInt(document.getElementById("year").value, 10) || 0;
    let season = parseInt(document.getElementById("season").value, 10) || 0;
    let month = parseInt(document.getElementById("month").value, 10) || 0;
    let significance = parseInt(document.getElementById("significance").value, 10) || 0;
    let state_id = parseInt(document.getElementById("state_id").value, 10) || 0;

    if (optionTime == 1) {
        season = 0;
        month = 0
    } else if (optionTime == 2) {
        month = 0;
    } else if (optionTime == 3 || optionTime == 4) {
        season = 0;
    }

    const formData = {
        depth,
        optionTime,
        year,
        season,
        month,
        significance,
        state_id
    };

    const stateIdElement = document.getElementById("state_id");
    const countryName = stateIdElement.options[stateIdElement.selectedIndex].text;

    const coordinates = await getCountryCoordinates(countryName);
    const dataModel = await getResultModel(formData);
    
    if (coordinates) {
        document.getElementById("showInfoModel").innerHTML = "";
        if (!mymap) {
            mymap = L.map('mapid').setView([coordinates.latitude, coordinates.longitude], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mymap);
        }

        mymap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                mymap.removeLayer(layer);
            }
        });

        let marker = L.marker([coordinates.latitude, coordinates.longitude]).addTo(mymap);
        marker.bindPopup(`<b>${countryName}</b><br>Magnitud: ${dataModel.magnitudo}<br>Frecuencia: ${dataModel.frequency}`).openPopup();
    }else{
        document.getElementById("showInfoModel").innerHTML = "";
        document.getElementById("showInfoModel").innerHTML = `<h2>Magnitud: ${dataModel.magnitudo}<br>Frecuencia: ${dataModel.frequency}</h2>`;
    }

});


