const sidebarPath = window.location.pathname.includes("/pages/")
    ? "../components/sidebar.html"
    : "components/sidebar.html";


fetch(sidebarPath)

.then(response => response.text())

.then(data => {

    document.getElementById("sidebar").innerHTML = data;


    const currentPage = window.location.pathname;


    document.querySelectorAll(".menu a").forEach(link => {


        const linkPath = link.getAttribute("href");


        if(currentPage.includes(linkPath.replace("../", ""))){

            link.classList.add("active");

        }


    });


})
.catch(error => {

    console.error("Sidebar loading error:", error);

});