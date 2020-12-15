$(function () {
    const $carList = $('#carList');
    const $manufacturerList = $('#manufacturerList');
    let cars = [];
    let manufacturers = [];
    let pressed = 0;
    let $swiperContainer = $('#swiper-container');
    let $swiperContent = $('#swiper-content')
    let $swiperTabs = $('.swiper-tab');
    let $swiperButtons = $('.swiper-button');
    let activeTabIndex = 0;
    let tabWidth = 0;

    function deleteButtonHandler(e) {

        let item = $(e.target).closest("li");
        let key = item.data('key');
        let type = item.data('type');
        if (type == 'car') {
            setErrorFeedBack('progress')
            deleteCar(key).then(() => {
                item.remove();
                setErrorFeedBack('success');
            }).catch(() => {
                setErrorFeedBack('error');
            });
        } else {
            setErrorFeedBack('progress');
            deleteManufacturer(key).then(() => {
                item.remove();
                setErrorFeedBack('success');
            }).catch(() => {
                setErrorFeedBack('error');
            });
        }
    }



    function cancelButtonHandler(e, originalItem) {
        let item = $(e.target).closest("form");
        let key = item.data('key');
        item.remove();
        if (originalItem) {
            originalItem.show();
        }
        setPressed(0);
    }


    function addButtonHandler(e) {
        if (pressed == 0) {
            setPressed(1);
            let item = $(e.target);
            let type = item.data('type');
            let li;
            switch (type) {
                case 'car':
                    $manufacturerOptions = generateSelectOptionsFromManufacturers(item.find('.key_manufacturer').text());

                    li = $('<form/>')
                        .addClass('menu-item')
                        .html('<div class="menu-item-column key_name"><input type="text" name="name" class="form-control" required /></div> <div class="menu-item-column key_consumption"><input type="number" name="consumption" class="form-control" placeholder="10" required />l/100km</div><div class="menu-item-column key_color"><input type="color" name="color" class="form-control" required></div><div class="menu-item-column key_manufacturer"><select name="manufacturer" required></select></div><div class="menu-item-column key_year"><input type="number" name="year" class="form-control" placeholder="2020"></div><div class="menu-item-column key_avaiable"><input type="number" name="avaiable" class="form-control" placeholder="Available" required /></div><div class="menu-item-column key_horsepower"><input type="number" name="horsepower" class="form-control" placeholder="40" required /></div><div class="menu-item-column buttons-column"><button type="submit" class="save button button-primary">Mentés</button><button class="cancel button button-primary" type="button">Mégse</button> </div>')
                        .data('type', 'car')
                        .appendTo($carList);

                    li.find('.key_manufacturer select').append($manufacturerOptions);
                    break;
                case 'manufacturer':
                    li = $('<form/>')
                        .addClass('menu-item')
                        .html('<div class="menu-item-column name"><input type="text" name="name" class="form-control" placeholder="Name" required /></div> <div class="menu-item-column founded"><input type="date"  name="founded" class="form-control" required /></div> <div class="menu-item-column country"><input type="text" name="country" class="form-control" placeholder="Country" required /></div> <div class="menu-item-column buttons-column"> <button type="submit" class="save button button-primary">Mentés</button> <button class="cancel button button-primary" type="button">Mégse</button> </div>')
                        .data('type', 'manufacturer')
                        .appendTo($manufacturerList);
                    break;
            }

            li.on('submit', submitHandler);
            $('.cancel').on('click', cancelButtonHandler);

        }
    }


    function modifyButtonHandler(e) {
        let item = $(e.target).closest("li");
        let key = item.data('key');
        let type = item.data('type');
        let li;
        switch (type) {
            case 'car':
                $manufacturerOptions = generateSelectOptionsFromManufacturers(item.find('.key_manufacturer').text());

                li = $('<form/>')
                    .addClass('menu-item')
                    .html(`<div class="menu-item-column key_name"><input type="text" name="name" class="form-control" value="${item.find('.key_name').text()}" required /></div> <div class="menu-item-column key_consumption"><input type="number" name="consumption" class="form-control" placeholder="10" value="${item.find('.key_consumption').text()}" required />l/100km</div><div class="menu-item-column key_color"><input type="color" name="color" class="form-control" value="${item.find('.key_color').text()}" required></div><div class="menu-item-column key_manufacturer"><select name="manufacturer" required></select></div><div class="menu-item-column key_year"><input type="number" name="year" class="form-control" placeholder="2020" value="${item.find('.key_year').text()}"></div><div class="menu-item-column key_avaiable"><input type="number" name="avaiable" class="form-control" placeholder="Available" value="${item.find('.key_avaiable').text()}" required /></div><div class="menu-item-column key_horsepower"><input type="number" name="horsepower" class="form-control" placeholder="40" value="${item.find('.key_horsepower').text()}" required /></div><div class="menu-item-column buttons-column"><button type="submit" class="save button button-primary">Mentés</button><button class="cancel button button-primary" type="button">Mégse</button> </div>`)
                    .data('type', 'car')
                    .data('key', key);

                li.find('.key_manufacturer select').append($manufacturerOptions);
                break;
            case 'manufacturer':
                li = $('<form/>')
                    .addClass('menu-item')
                    .html(`<div class="menu-item-column key_name"><input type="text" name="name" class="form-control" placeholder="Name"  value="${item.find('.key_name').text()}"  required /></div> <div class="menu-item-column key_founded"><input type="date"  name="founded" class="form-control"  value="${item.find('.key_founded').text()}" required /></div> <div class="menu-item-column key_country"><input type="text" name="country" class="form-control" placeholder="Country"  value="${item.find('.key_country').text()}" required /></div> <div class="menu-item-column buttons-column"> <button type="submit" class="save button button-primary">Mentés</button> <button class="cancel button button-primary" type="button">Mégse</button> </div>`)
                    .data('type', 'manufacturer')
                    .data('key', key);
                break;
        }

        li.insertAfter(item);
        item.hide();

        li.on('submit', submitHandler);
        $('.cancel').on('click', (e) => {
            cancelButtonHandler(e, item);
        });
    }

    function submitHandler(e) {
        e.preventDefault();

        let item = $(e.target);

        let key = item.data('key');
        let type = item.data('type');
        let formData = item.serializeArray();
        let network_task;

        switch (type) {
            case 'car':
                let car = {
                    _id: key || null,
                    name: formData.find(i => i.name === 'name').value,
                    consumption: formData.find(i => i.name === 'consumption').value,
                    color: formData.find(i => i.name === 'color').value,
                    manufacturer: formData.find(i => i.name === 'manufacturer').value,
                    year: formData.find(i => i.name === 'year').value,
                    avaiable: formData.find(i => i.name === 'avaiable').value,
                    horsepower: formData.find(i => i.name === 'horsepower').value,
                }

                network_task = key ? updateCar(car) :
                    createCar(car);
                setErrorFeedBack('progress');
                network_task.then(() => {
                    item.remove();
                    getCars().then(() => {
                        updateDom();
                        setErrorFeedBack('success');
                    }).catch(() => {
                        setErrorFeedBack('error');
                    })
                }).catch(() => {
                    setErrorFeedBack('error');
                })
                break;
            case 'manufacturer':
                let manufacturer = {
                    _id: key || null,
                    name: formData.find(i => i.name === 'name').value,
                    founded: formData.find(i => i.name === 'founded').value,
                    country: formData.find(i => i.name === 'country').value
                }
                network_task = key ? updateManufacturer(manufacturer) : createManufacturer(manufacturer);
                setErrorFeedBack('progress');
                network_task.then(() => {
                    item.remove();
                    getManufacturers().then(() => {
                        updateDom();
                        setErrorFeedBack('success');
                    }).catch(() => {
                        setErrorFeedBack('error');
                    })
                }).catch(() => {
                    setErrorFeedBack('error');
                });
                break;
        }
    }

    //GET
    function getCars() {
        return new Promise((resolve, reject) => {
            $.get("https://webtechcars.herokuapp.com/api/cars", (data) => {
                cars = data;
                resolve();
            }).fail(() => {
                reject();
            });
        });

    }

    function getManufacturers() {
        return new Promise((resolve, reject) => {
            $.get("https://webtechcars.herokuapp.com/api/manufacturers", function (data) {
                manufacturers = data;
                resolve();
            }).fail(() => {
                reject();
            });
        });
    }

    //CREATE
    function createCar(car) {
        return new Promise((resolve, reject) => {
            let data = car;
            return $.post("https://webtechcars.herokuapp.com/api/cars", JSON.stringify(data), function (data) {
                cars.push(data);
                resolve();
            }).fail(() => {
                reject();
            });
        });
    };

    function createManufacturer(manufacturer) {
        return new Promise((resolve, reject) => {
            let data = manufacturer;
            $.post("https://webtechcars.herokuapp.com/api/manufacturers", JSON.stringify(data), function (data) {
                manufacturers.push(data);
                resolve();
            }).catch(() => {
                reject();
            });
        });
    }

    //UPDATE
    function updateCar(car) {
        return new Promise((resolve, reject) => {
            deleteCar(car._id).then(() => {
                createCar(car).then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                });
            }).catch(() => {
                reject();
            })
        });
    };


    function updateManufacturer(manufacturer) {
        return new Promise((resolve, reject) => {
            deleteManufacturer(manufacturer._id).then(() => {
                createManufacturer(manufacturer).then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                });
            }).catch(() => {
                reject();
            })
        });
    }

    //DELETE
    function deleteCar(id) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://webtechcars.herokuapp.com/api/cars/' + id,
                type: 'DELETE',
                success: function (data) {
                    let r = cars.findIndex(car => car._id === id);
                    if (r !== -1) {
                        cars.splice(r, 1);
                    }

                    resolve();

                },
                error: function () {
                    reject();
                }
            });
        });

    }

    function deleteManufacturer(id) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://webtechcars.herokuapp.com/api/manufacturers/' + id,
                type: 'DELETE',
                success: function (data) {
                    let r = manufacturers.findIndex(car => car._id === id);
                    if (r !== -1) {
                        manufacturers.splice(r, 1);
                    }

                    resolve();
                },
                error: function () {
                    reject();
                }
            });
        });
    }

    function formatDateForFounded(date) { //Ex. November 1, 1950
        let _date = new Date(date);
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${months[_date.getMonth()]} ${_date.getDate()}, ${_date.getFullYear()}`;
    }

    function setPressed(value) {
        pressed = value;
        if (pressed) {
            $('.modify').prop('disabled', true);
            $('.add').prop('disabled', true);
        } else {
            $('.modify').prop('disabled', false);
            $('.add').prop('disabled', false);
        }
    }

    function setErrorFeedBack(progress) {
        switch (progress) {
            case 'success':
                $('#ajaxStatus').text('Kérés bejefezve');
                $('#errorSpinner').hide();
                break;
            case 'progress':
                $('#ajaxStatus').text('Kapcsolódás');
                $('#errorSpinner').show();
                break;
            case 'error':
                $('#ajaxStatus').text('Hiba');
                $('#errorSpinner').hide();
                break;
        }
    }

    function generateSelectOptionsFromManufacturers(selected_name) {
        let options = [];
        $.each(manufacturers, (key, value) => {
            let o = $('<option />')
                .data('key', value._id)
                .text(value.name);

            if (value.name === selected_name) {
                o.attr('selected', true);
            }

            options.push(o);
        });



        return options;
    }

    function updateDom() {
        $carList.html('');
        $manufacturerList.html('');

        $.each(cars, (key, value) => {
            let li = $('<li/>')
                .addClass('menu-item')
                .html(`<div class="menu-item-column key_name">'${value.name}</div> <div class="menu-item-column key_consumption">${value.consumption}</div> <div class="menu-item-column key_color">${value.color}</div> <div class="menu-item-column key_manufacturer">${value.manufacturer}</div> <div class="menu-item-column key_year">${value.year}</div> <div class="menu-item-column key_avaiable">${value.avaiable}</div> <div class="manu-item-column buttons-column key_horsepower">${value.horsepower}</div ><div class="menu-item-column"> <button class="modify button button-primary">Módosítás</button> <button class="delete button button-primary">Törlés</button> </div>`)
                .data('key', value._id)
                .data('type', 'car')
                .appendTo($carList);
        });
        $.each(manufacturers, (key, value) => {
            let li = $('<li/>')
                .addClass('menu-item')
                .html(`<div class="menu-item-column key_name">${value.name}</div> <div class="menu-item-column key_founded">${value.founded}</div> <div class="menu-item-column key_country">${value.country}</div> <div class="menu-item-column buttons-column"> <button class="modify button button-primary">Módosítás</button> <button class="delete button button-primary">Törlés</button> </div>`)
                .data('key', value._id)
                .data('type', 'manufacturer')
                .appendTo($manufacturerList);
        })

        $(".delete").click(deleteButtonHandler);
        $(".modify").on('click', modifyButtonHandler);
    }


    //Swiperparts

    /**
     * Snippet for preventing focus on not active tab
     */
    function focusTrap() {
        const focusables = ['input', 'button', 'textarea', 'select', 'a'];

        $swiperTabs.each((i, tab) => {
            $.each(focusables, (j, tag) => {
                $(tab).find(tag).each((k, focusable) => {

                    let $focusable = $(focusable);

                    if (!$(tab).hasClass('active') && $focusable.prop('disabled') != 'disabled') {
                        $focusable.data('focusTrapDisabled', true);
                        $focusable.prop('disabled', true);
                        $focusable.prop('tabIndex', -1);
                    } else if ($focusable.data('focusTrapDisabled') == true && $(tab).hasClass('active')) {
                        $focusable.data('focusTrapDisabled', false);
                        $focusable.prop('disabled', false);
                        $focusable.prop('tabIndex', '');
                    }
                })
            });
        })
    }

    function setSwiperTabWidth() {
        let _width = $swiperContainer.width();
        tabWidth = _width;
        $swiperTabs.each((index, tab) => {
            $(tab).width(_width);
        })

        setSwiperTransform();
    }

    function setSwiperTransform() {
        $swiperContent.css('transform', `translateX(${-activeTabIndex * tabWidth}px)`);
    }

    function setActiveTab(index) {
        activeTabIndex = index;
        $swiperTabs.removeClass('active');
        $($swiperTabs[index]).addClass('active');
        setSwiperTransform();
        focusTrap();
        $('.cancel').click();
    }

    function swiperButtonHandler(event) {
        //Handle class change
        $swiperButtons.removeClass('active')
        $(event.target).addClass('active');

        let index = $(event.target).data('tab-index');
        setActiveTab(index);
    }

    //Init
    $.ajaxSetup({
        contentType: "application/json; charset=utf-8",
    });
    setErrorFeedBack('progress');
    Promise.all([getCars(),
    getManufacturers()]).then(() => {
        updateDom();
        setErrorFeedBack('success');
    }).catch(() => {
        setErrorFeedBack('error')
    });

    $('.add').on('click', addButtonHandler);
    $(window).on('resize', setSwiperTabWidth);
    setSwiperTabWidth();
    setActiveTab(0);
    $swiperButtons.on('click', swiperButtonHandler);

    window.consoleAPI = {
        showCars: function () {
            console.log(cars);
        },

        showManufacturers: function () {
            console.log(manufacturers);
        },

        createCar: function (car) {
            createCar(car);
        },

        createManufacturer: function (manufacturer) {
            createManufacturer(manufacturer);
        },

        updateCar: function (car) {
            updateCar(car);
        },

        updateManufacturer: function (manufacturer) {
            updateManufacturer(manufacturer);
        },

        deleteCar: function (id) {
            deleteCar(id);
        },

        deleteManufacturer: function (id) {
            deleteManufacturer(id);
        },

        updateDom: function () {
            updateDom();
        },

        cars: cars,
        manufacturers: manufacturers


    }

});