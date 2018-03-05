if (![].contains) {
  Object.defineProperty(Array.prototype, 'contains', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(searchElement/*, fromIndex*/) {
      if (this === undefined || this === null) {
        throw new TypeError('Cannot convert this value to object');
      }
      var O = Object(this);
      var len = parseInt(O.length) || 0;
      if (len === 0) { return false; }
      var n = parseInt(arguments[1]) || 0;
      if (n >= len) { return false; }
      var k;
      if (n >= 0) {
        k = n;
      } else {
        k = len + n;
        if (k < 0) k = 0;
      }
      while (k < len) {
        var currentElement = O[k];
        if (searchElement === currentElement ||
            searchElement !== searchElement && currentElement !== currentElement
        ) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};


var Calendar = Calendar || {};

var dayNames 		 = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
var finalMes 	 	 = ['31','28','31','30','31','30','31','31','30','31','30','31'];
var finalMesBissexto = ['31','29','31','30','31','30','31','31','30','31','30','31'];
var Meses    		 = ['Jan','Fev','Mar','Abr','Maio','Jun','Jul','Ago','Set','Out','Nov','Dez'];
var anosBissextos 	 = ['2016','2020','2024','2028','2032'];

finalMes = (anosBissextos.contains("" + (new Date()).getFullYear())) ? finalMesBissexto : finalMes;

Calendar = function(API, key, ID) {

	var _ = this;

	_.API = API;
	_.key = key;
	_.ID  = ID;

	/*
	*	@description
	*
	*	Método que realizará o request do json com os eventos do google
	* 	Verificará se tem mais de 249 posições do array, pois se existir mais
	* 	Posições, ele terá que alterar a URI de request.
	*
	*	@return {Function} getCalendar
	*/
	_.getCalendar = function(){
		$.getJSON( API , function(json, textStatus) {
			$(".no-event").html("<hr><p class='text-center'>Sem Evento</p>");			
			_.montaData();
	        var date    = new Date();
	        var dia     = date.getDate();
	        
	        var mes 	= ((date.getMonth() + 1) <= 10 ) ? date.getMonth() + 1 : "" + date.getMonth() + 1;
			var ano 	= date.getFullYear(); 
			mes = ((mes) < 10 ) ? ("0" + mes) : mes;
			
			if( json.items.length >= 249 && (json.items[249].start.dateTime.slice(0,10) < ano + "-" + mes + "-" + dia )){
				_.API = "https://www.googleapis.com/calendar/v3/calendars/"+ _.ID +"/events?pageToken="+ json.nextPageToken +"&orderBy=startTime&singleEvents=true&key=" + _.key;
				$.getJSON( _.API,  function(json2, textStatus) {
						_.montaCalendario(json2);
				});
			}else{
				_.montaCalendario(json);
			}
		});
		return _;
	};

	_.diaSemana = function(p_mes){
	    var hojeDate = new Date();
	    var dia      = hojeDate.getDate();
	    var mes      = (p_mes > 10 ) ? p_mes : "0" + p_mes;
	    var ano      = hojeDate.getFullYear();

	    //console.log(mes, p_mes, ((p_mes) > 10 ) ? p_mes : "0" + p_mes);

	    switch(dayNames[hojeDate.getDay()]){
	        case 'Segunda':
	            return (dia > 10) ? ano + "-" + (mes) +'-'+ (dia - 1) : hojeDate.getFullYear()+ "-" + (mes) +'-0'+ (dia - 1);
	        case 'Terça':
	            return (dia > 10) ? ano + "-" + (mes) +'-'+ (dia - 2) : hojeDate.getFullYear()+ "-" + (mes) +'-0'+ (dia - 2);
	        case 'Quarta':
	            return (dia > 10) ? ano + "-" + (mes) +'-'+ (dia - 3) : hojeDate.getFullYear()+ "-" + (mes) +'-0'+ (dia - 3);
	        case 'Quinta':
	            return (dia > 10) ? ano + "-" + (mes) +'-'+ (dia - 4) : hojeDate.getFullYear()+ "-" + (mes) +'-0'+ (dia - 4);
	        case 'Sexta':
	            return (dia > 10) ? ano + "-" + (mes) +'-'+ (dia - 5) : hojeDate.getFullYear()+ "-" + (mes) +'-0'+ (dia - 5);
	        case 'Sabado':
	            return (dia > 10) ? ano + "-" + (mes) +'-'+ (dia - 6) : hojeDate.getFullYear()+ "-" + (mes) +'-0'+ (dia - 6);
	        default : 
	        	return (dia > 10) ? ano + "-" + (mes) +'-'+ (dia) : hojeDate.getFullYear()+ "-" + (mes) +'-0'+ (dia);
	    }
	};

	/**
	*	@description
	*
	*   Função verifica o dia atual, e compara para ver se o dia é inicio de mes
	* 	E começa no meio da semana, fazendo os dias anteriores serem os ultimos
	* 	Do mês passado
	*
	*   @return {String} inicioMes
	*
	*/
	_.inicioMes = function(){
	    var hojeDate = new Date();
	    var dia      = hojeDate.getDate();
	    var mes      = ((hojeDate.getMonth() + 1) > 10 ) ? hojeDate.getMonth() + 1 : "" + (hojeDate.getMonth() + 1);
	    var ano      = hojeDate.getFullYear();
	    var inicioMes;
	    var diff;
	    
	    switch(dayNames[hojeDate.getDay()]){
	    	/**
	    	*	Diminuimos o dia pela diferença de domingo, <no caso segunda, é 1 dia de diferença>
	    	* 	Se o dia for menor que 10, colocamos um "0" na frente do numero para a formatação
	    	*/
	        case 'Segunda':
	        	diff 	= Math.abs(dia - 1);	
	        	dia 	= (dia > 10) ? (dia - 1) : "0" + (dia - 1);
	        	
	            if(dia == "00" || parseInt(dia) === 0){
	            	inicioMes = _.setInicioMes(dia, diff, (mes - 1), ano);
	            }else{
	            	inicioMes = ano + "-" + (mes) +'-'+ (dia);
	            }
	           
	        break;
	        case 'Terça':
	        	diff 	= Math.abs(dia - 2);	
	        	dia 	= (dia > 10) ? (dia - 2) : "0" + (dia - 2);
	        	
	            if(dia == "00" || parseInt(dia) === 0){
	            	inicioMes = _.setInicioMes(dia, diff, (mes - 1), ano);
	            }else{
	            	inicioMes = ano + "-" + (mes) +'-'+ (dia);
	            }
	           
	            
	        break;
	        case 'Quarta':
	        	diff 	= Math.abs(dia - 3);	
	        	dia 	= (dia > 10) ? (dia - 3) : "0" + (dia - 3);
	        	
	            if(dia == "00" || parseInt(dia) === 0){
	            	inicioMes = _.setInicioMes(dia, diff, (mes - 1), ano);
	            }else{
	            	inicioMes = ano + "-" + (mes) +'-'+ (dia);
	            }
	           
	        break;
	        case 'Quinta':     
	        	diff 	= Math.abs(dia - 4);	
	        	dia 	= (dia > 10) ? (dia - 4) : "0" + (dia - 4);
	        	
	            if(dia == "00" || parseInt(dia) === 0){
	            	inicioMes = _.setInicioMes(dia, diff, (mes - 1), ano);
	            }else{
	            	inicioMes = ano + "-" + (mes) +'-'+ (dia);
	            }
	        break;
	        case 'Sexta':
	        	diff 	= Math.abs(dia - 5);	
	        	dia 	= (dia > 10) ? (dia - 5) : "0" + (dia - 5);

	            if(dia == "00" || parseInt(dia) === 0){
	            	inicioMes = _.setInicioMes(dia, diff, (mes - 1), ano);
	            }else{
	            	inicioMes = ano + "-" + (mes) +'-'+ (dia);
	            }
	            	            
	        break;
	        case 'Sabado':
	        	diff 	= Math.abs(dia - 6);	
	        	dia 	= (dia > 10) ? (dia - 6) : "0" + (dia - 6);
	        	
	            if(dia == "00" || parseInt(dia) === 0){
	            	inicioMes = _.setInicioMes(dia, diff, (mes - 1), ano);
	            }else{
	            	inicioMes = ano + "-" + (mes) +'-'+ (dia);
	            }
	        break;
	        default :
	            inicioMes = (dia > 10) ? ano + "-" + (mes) +'-'+ (dia) :ano + "-" + (mes) +'-0'+ (dia);
            break;
	    }
	    return inicioMes;
	};

	_.setInicioMes = function(dia, diff, mes, ano){
		var hojeDate = new Date();
        //	Setamos o dia como a matriz finalMes na posição do mês anterior, 
        //	pegando o total de dias do mes e diminuindo pela diferença, 
        //	assim dando o dia inicial daquela semana.    	
    	dia = parseInt(finalMes[mes - 1]);
    	dia = dia - diff;

    	return ano + "-" + (mes) +'-'+ (dia);
	};

	/**
	*
	*   Esta função serve para limpar o objeto passado por parametro
	*   Todos os campos que possuem valor 'false' são deletados
	*
	*   @param {Object} obj
	*   @return {Object} obj
	*/
	_.limpaObjeto = function(obj){
	    for(var prop in obj){
	        if(obj.hasOwnProperty(prop) && !obj[prop]){
	            delete(obj[prop]);
	        }
	    }
	    return obj;
	};

	/**
	* 	@descrição
	*
	*   Esta função serve para montar o objeto que contém as regras
	*   de listagem dos eventos, se é mensal, semanal, se repete, e etc.
	*   
	*   Primeiro montamos um array com o valor do objeto
	*   Separando os parâmetro com ';', montamos o objeto com as seguintes propriedades:
	*
	*   - `RULE`     : Contem um objeto dentro chamado FREQ que é a frequência;
	*   - `BYDAY`    : Dias da semana que o evento acontecerá;
	*   - `INTERVAL` : Intervalo de dias que o evento irá acontecer;
	*   - `COUNT`    : Numero de vezes que irá se repetir em uma sequênia;
	*   - `UNTIL`    : Dia que encerrará o evento caso seja mensal.
	*
	*   @param {Object} value
	*   @return {Object} obj_regra
	*/
	_.regrasCalendario = function(value){
	    var regra = value.recurrence[0].split(";");
	    var BYDAY = regra[regra.length - 1];
	    
	    var rule = {
	        FREQ :  (regra[0].substr(0,5) != "RRULE") ? regra[1].slice(11) : regra[0].slice(11)
	    };

	    /*
	    *   Verificamos se a posição [1] de 'regra' será um dos parâmetros
	    *   Caso não seja damos a variavel o valor de false.
	    */
	    var byday    = BYDAY.slice(6);
	    var count    = (regra[1].slice(0,5) == "COUNT") ? regra[1].slice(6) : false;
	    var interval = _.makeInterval(regra);
	    var until    = (regra[1].slice(0,5) == "UNTIL") ? regra[1].slice(6) : false;

	    /**
	    *   Montamos o obj_regra com as propriedades citadas acima
	    *   Verificando se o valor da propriedade existe, se não existir
	    *   Damos o valor de false a ela para a função 'limpaObjeto' deleta-las.
	    */
	    var obj_regra = {
	        RULE     : (regra[0].substr(0,5) == "RRULE") ? rule : regra[1].slice(11),
	        BYDAY    : (BYDAY.substr(0,5)    == "BYDAY") ? byday : false,
	        COUNT    : (regra[1].substr(0,5) == "COUNT") ? count : false,
	        INTERVAL : (regra[1].substr(0,8) == "INTERVAL"  || regra[regra.length - 1].substr(0,8) == "INTERVAL") ? interval : false,
	        UNTIL    : (regra[1].substr(0,5) == "UNTIL") ? until : false
	    };

	    _.limpaObjeto(obj_regra);

	    return obj_regra;
	};

	_.makeInterval = function(regra){
	    if(regra[1].slice(0,8) == "INTERVAL"){
	        return regra[1].slice(9);
	    }else if(regra[regra.length - 1].slice(0,8) == "INTERVAL"){
	        return regra[regra.length - 1].slice(9);
	    }else{
	        return false;
	    }
	};

	/**
	*   Esta função desmonta a data de encerramento do evento
	*   E transforma em um formato legível para o javascript.
	*
	*   @param {String} UNTIL
	*   @return {String} ano
	*/
	_.encerramentoEventoMensal = function(UNTIL){
	    var ano = UNTIL.slice(0,4);
	    var mes = UNTIL.slice(4,6);
	    var dia = UNTIL.slice(6,8);
	    
	    return ano + "-" + mes + "-" + dia;
	};

	/**
	*   Esta função é para quando tem eventos seguidos,
	*   verificando se é diário ou semanal 
	*   
	*   @param {Object} value
	*   @param {String} mes
	*   @param {String} data
	*   @param {String} titulo
	*   @return {Function} sequenciaSemana
	*   @return {Function} sequenciaDiaria
	*   
	*/
	_.eventosSeguidos = function(value, mes, data, titulo){
	    var freq = value.recurrence.RULE.FREQ;

	    if(freq == "WEEKLY"){
	        return _.sequenciaSemana(value, mes, data, titulo);
	    } else if(freq == "DAILY"){
	        return _.sequenciaDiaria(value, mes, data, titulo);
	    }
	};

	/**
	*   Esta função calcula os dias que o evento irá se repetir
	*   E appenda ele se não tiver dado a data limite (end)
	*
	*/
	_.sequenciaDiaria = function(value, mes, data, titulo){
	    var hoje    = new Date();
	    var horario = (value.start.dateTime) ? value.start.dateTime.slice(11, 16) : "Dia todo";

	    var dia = parseInt(data.slice(8,10));
	    var end = (value.recurrence.COUNT) ? hoje.getFullYear() + "-" + hoje.getMonth() + 1 + "-" + (parseInt(data.slice(8,10)) + parseInt(value.recurrence.COUNT)) : "2300-01-01";
	    
	    for(dia; dia < (parseInt(value.recurrence.COUNT) + parseInt(data.slice(8,10))); dia++){
	        if(end >= _.diaSemana(mes)){
	        	/*jshint multistr: true */
	            $((dia <= 10) ? "#0"+ (dia - 1) : "#" + (dia - 1) ).append("\
	                <div class='dia'>\
	                    <span class='title'>"+ titulo +"</span><br>\
	                    <span class='horario'>"+ horario +"</span>\
	                </div>\
	            ");
	            $((dia < 10) ? "#0" + (dia - 1) + " .no-event" : "#" + (dia - 1)  + " .no-event").html("");
	        }
	    }
	};


	/**
	*   Esta função calcula as semanas que o evento irá se repetir
	*   E appenda ele se não tiver dado a data limite (end)
	*/
	_.sequenciaSemana = function(value, mes, data, titulo){
	    var hoje    = new Date();
	    var repete  = value.recurrence.BYDAY.split(',');
	    var horario = (value.start.dateTime) ? value.start.dateTime.slice(11, 16) : "Dia todo";

	    var dia = parseInt(data.slice(8,10)) + 1;
	    var end = parseInt(data.slice(8,10)) + parseInt(value.recurrence.COUNT);
		
	    if(!repete.contains('SA') && !repete.contains('SU')){
	        end = end + 1;
	    }

	    end = hoje.getFullYear() + "-" + hoje.getMonth() + 1 + "-" + end;

	    var i;
	    var dataLoop;

	    if(!repete.contains('SA') && !repete.contains('SU') && repete.length == 5){
	        for(i = 0 ; i <= parseInt(value.recurrence.COUNT); i++){
	            dataLoop = new Date(hoje.getFullYear() + "-" + hoje.getMonth() + 1 + "-" + ((dia < 10) ? "0" + dia : dia ));
	            if(end >  _.diaSemana(mes)){

	                switch(dayNames[dataLoop.getDay()]){
	                    case 'Sabado' :
	                        dia = (dia >= 30 ) ? dia + 2 : dia + 1;
	                    break;
	                    case 'Domingo' :
	                        dia = dia + 1;
	                    break;
	                    default :
	                        _.appendData(((dataLoop.getDate() < 10) ? "0" + dataLoop.getDate()  : dataLoop.getDate() ), horario, titulo);
	                        dia = dia + 1;
	                    break;
	                }
	            }
	        }
	    }else if(!repete.contains('SA') && !repete.contains('SU') && repete.length == 3){
	    	
	        for(i = 0 ; i <= parseInt(value.recurrence.COUNT); i++){
	            dataLoop = new Date(hoje.getFullYear() + "-" + hoje.getMonth() + 1 + "-" + ((dia < 10) ? "0" + dia : dia ));
	            if(end >= _.diaSemana(mes)){
	                switch(dayNames[dataLoop.getDay()]){
	                    case 'Sabado' :
	                        dia = (dia >= 30 ) ? dia + 2 : dia + 1;
	                    break;
	                    case 'Domingo' :
	                        dia = dia + 1;
	                    break;
	                    default :
	                        _.appendData(((dataLoop.getDate() < 10) ? "0" + dataLoop.getDate() : dataLoop.getDate() ), horario, titulo);
	                        dia = dia + 2;
	                    break;
	                }   
	            }
	        }
	    }else if(!repete.contains('SA') && !repete.contains('SU') && repete.length == 2){
            dataLoop = new Date(hoje.getFullYear() + "-" + hoje.getMonth() + 1 + "-" + ((dia < 10) ? "0" + dia : dia ));
            if(dayNames[dataLoop.getDay()] == "Sabado"){
                dia = (dia >= 30 ) ? dia + 2 : dia + 1;
            }else if(dayNames[dataLoop.getDay()] == "Domingo"){
                dia = dia + 1;
            }else{
                _.appendData(((dataLoop.getDate() < 10) ? "0" + dataLoop.getDate()  : dataLoop.getDate() ), horario, titulo);
                dia = dia + 2;
            }
	    }    
	};
	/**
	*
	*   Esta função monta os dias da semana na seção do calendário
	*   Fazendo aparecer o dia e qual o dia da semana ele representa
	*
	*/
	_.montaData = function (){
	    var inicio  = _.inicioMes();
	    var semana  = new Date(inicio);
	    var dia     = parseInt(semana.getDate());
	    var mes 	= parseInt(inicio.slice(5,7)) - 1;
	    var finalDoMes = finalMes[semana.getMonth()];
	    var diaString;

	    for(var i = 0; i <= 6; i++){

	        diaString = (dia < 10) ? ("0" + dia) : dia;

	        $("."+ dayNames[semana.getDay() + i]).attr("id", diaString);
	        $("."+ dayNames[semana.getDay() + i] +" .nome").html((dayNames[semana.getDay() + i] != "Sabado" && dayNames[semana.getDay() + i] != "Domingo") ? dayNames[semana.getDay() + i] + "-Feira" : dayNames[semana.getDay() + i]);
	        $("."+ dayNames[semana.getDay() + i] +" .data").html(diaString +"/"+ Meses[mes]);

	        if(dia >= finalDoMes){
	        	dia = 0;
	        	mes = (mes >= 11) ? 0 : mes + 1;
	        }else if(dia < 1){
	        	mes = mes - 1;
	        }

	        dia++;
	    }
	};
	/**
	*	Monta a div da data, preenchendo o titulo
	* 	e o horario do evento e limpando a mensagem
	* 	'Sem Evento'.
	*/
	_.appendData = function( dia, horario, titulo){
	    horario = horario || "Dia todo";
	    /*jshint multistr: true */
	    $("#"+ dia).append("\
	        <div class='dia'>\
	            <span class='title'>"+ titulo +"</span><br>\
	            <span class='horario'>"+ horario +"</span>\
	        </div>\
	    ");

	    $("#" + dia + " .no-event").html("");
	};
	/**
	*	Monta a div da data, preenchendo o titulo
	* 	e o horario do evento apenas nas TERÇAS E QUINTAS
	* 	e limpando a mensagem 'Sem Evento'.
	*/
	_.appendSemana = function(data, semana, dia, horario, titulo){
	    var inicio = new Date();

	    inicio     = inicio.getFullYear() + "-" + inicio.getMonth() + 1 + "-" + inicio.getDate();
	    horario    = horario || "Dia todo";

	    dia = (parseInt(dia) > 10) ? dia + 1 : "0" + (parseInt(dia) + 1);

	    if(data <= inicio && semana === "Terça" || semana === "Quinta"){
	    	/*jshint multistr: true */
	        $(".Terça, .Quinta").append("\
	            <div class='dia'>\
	                <span class='title'>"+ titulo +"</span><br>\
	                <span class='horario'>"+ horario +"</span>\
	            </div>\
	        ");

	        $(".Terça .no-event, .Quinta .no-event").html("");
	    }else if(data <= inicio){
	    	
	    	/*jshint multistr: true */
	        $("." + semana).append("\
	            <div class='dia'>\
	                <span class='title'>"+ titulo +"</span><br>\
	                <span class='horario'>"+ horario +"</span>\
	            </div>\
	        ");

	        $("." + semana + " .no-event").html("");	    	
	    }
	};

	_.interval = function(value){
	    var FREQ     = value.recurrence.RULE.FREQ;
	    var INTERVAL = parseInt(value.recurrence.INTERVAL);
	    var data     = ( value.start.dateTime ) ? value.start.dateTime : value.start.date;
	    var titulo   = value.summary || "Sem Título";

	    switch(FREQ){
	        case 'WEEKLY' :
	            _.intervaloSemana(INTERVAL, data, titulo, value);
	        break;
	        case 'DAILY' :
	            _.intervaloDiario(INTERVAL, data, titulo, value);
	        break;
	    }
	};

	_.intervaloSemana = function(INTERVAL, data, titulo, value){
	    var semana       = (new Date(data)).getWeek();
	    var arraySemanas = [];
	    var hoje         = new Date();
	    var semanaAtual  = hoje.getWeek();

	    while(semana <= 52){
	        arraySemanas.push(semana);     
	        semana = semana + INTERVAL;
	    }

	    $.each(arraySemanas, function(key, n_semana) {
	         if(n_semana === semanaAtual){
	            _.appendSemana(data, dayNames[(new Date(data)).getDay() + 1], (new Date(data)).getDate(), data.slice(11, 16), titulo);
	         }
	    });
	};

	_.intervaloDiario = function(INTERVAL, data, titulo, value){
	    var dia       = (new Date(data)).getDate() + 1;
	    var arrayDias = [];

	    while(dia <= 32){
	        arrayDias.push(dia);
	        dia = dia + INTERVAL;
	    }
	    $.each(arrayDias, function(key, n_dia) {
	        _.appendData(n_dia, data.slice(11, 16), titulo);
	    });  
	};
	
	_.montaCalendario = function(json){
        var date    = new Date();
        var dia     = date.getDate();
        
        var mes 	= ((date.getMonth() + 1) <= 10 ) ? date.getMonth() + 1 : "" + date.getMonth() + 1;
		var ano 	= date.getFullYear(); 

        $.each(json.items, function(key, value) {
            /** 
            *   `Titulo` : Verifica se o titulo é undefined, se for imprime "Sem Título",
            * 	`Data`   : Data inicial do evento,
            * 	`Semana` : Data inicial com formatação Date,
            * 	`End` 	 : Data de encerramento do evento
            */
            if(value.status !== "cancelled"){
            	/*jshint multistr: true */
                var titulo   = value.summary || "Sem Título";
                var data     = (value.start.dateTime) ? value.start.dateTime : value.start.date;
                var semana   = new Date( data );
                var end      = (value.end.dateTime) ? value.end.dateTime.slice(0,10) : value.end.date;
                var rule     = false;
                var skip     = false;
                
                if(value.recurrence || value.recurringEventId){
          
            	 	if(value.recurrence){
                    	value.recurrence = _.regrasCalendario(value);

                    	if ( value.recurrence.BYDAY === "TU,TH"){
                    	    _.appendSemana(data, dayNames[semana.getDay() + 1] ,data.slice(8,10), data.slice(11, 16), titulo);
                    	    skip = true;
                    	    rule = true;
                    	}
                    	if(value.recurrence.UNTIL){
                    	    end = _.encerramentoEventoMensal(value.recurrence.UNTIL);
                    	}
                    	if(value.recurrence.INTERVAL){
                    	    _.interval(value);
                    	}
                    	if(value.recurrence.COUNT && value.recurrence.BYDAY !== "TU,TH" && !value.recurrence.INTERVAL){
	
                    	    _.eventosSeguidos(value, mes, data, titulo);
                    	    skip = true;
                    	    rule = true;
                    	}
                    	if (value.recurrence.BYDAY && value.sequence == 1){
                    	    _.appendSemana(data, dayNames[semana.getDay()] ,data.slice(8,10), data.slice(11, 16), titulo);
                    	    skip = true;
                    	    rule = true;
                    	}
                    	if(value.recurrence.RULE.FREQ === "WEEKLY" && end >= _.diaSemana(mes) && !skip){
	                	    if (value.recurrence.BYDAY){
	                	        _.appendSemana(data, dayNames[semana.getDay() + 1] ,data.slice(8,10), data.slice(11, 16), titulo);
	                	        skip = true;
	                	        rule = true;
	                	    }
	                	    
                    	    _.appendData(data.slice(8,10), data.slice(11, 16), titulo);
                    	    skip = true;
                    	    rule = true;
	
                    	} else if(value.recurrence.RULE.FREQ === "MONTHLY"  && end >= _.diaSemana(mes) && !skip)
                    	{

                    	    _.appendData(data.slice(8,10), data.slice(11, 16), titulo);
                    	    rule = true;    
                    	    skip = true;
	
                    	} else if(value.recurrence.RULE.FREQ === "DAYLY"  && end >= _.diaSemana(mes) && !skip)
                    	{
                    	    _.appendData(data.slice(8,10), data.slice(11, 16), titulo);
                    	    rule = true;   
                    	    skip = true; 
                    	} 
                	}           
                }
                
                if(value.start.dateTime != undefined){
                    if(data.slice(0, 10) >= _.diaSemana(mes)&& mes == data.slice(5,7) && ano == data.slice(0,4) && data.slice(8,10) < ( dia + 7)){
                        _.appendData(value.start.dateTime.slice(8,10), value.start.dateTime.slice(11, 16), titulo);
                    }
                }else{
                    if(data >= _.diaSemana(mes) && mes == value.start.date.slice(5,7) && ano == value.start.date.slice(0,4) && data.slice(8,10) < ( dia + 7) && !skip){
                        _.appendData(value.start.date.slice(8,10), "Dia Todo", titulo);
                    }
                }
            }
        });
	};
};
