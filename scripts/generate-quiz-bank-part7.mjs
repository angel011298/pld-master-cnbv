// Quiz Bank Part 7 — Casos Prácticos Aplicados
// 25 preguntas | 10 fácil | 12 medio | 3 difícil
// Posiciones respuesta_correcta: 0×7, 1×6, 2×6, 3×6

export const quizPart7 = [
  {
    pregunta: "CASO PRÁCTICO: Un cliente deposita $9,800 pesos en efectivo tres veces durante la misma semana en distintas ventanillas de la misma sucursal. ¿Qué técnica de lavado de dinero describe este patrón?",
    opciones: [
      "Estructuración (pitufeo), diseñada para mantenerse por debajo del umbral de reporte y evitar generar un Reporte de Operación Relevante",
      "Estratificación mediante múltiples capas de transferencias electrónicas nacionales",
      "Integración a través de inversión en activos de valor real como inmuebles o vehículos",
      "Colocación directa mediante depósito único en una sola operación de gran monto"
    ],
    respuesta_correcta: 0,
    explicacion: "Tres depósitos de $9,800 en la misma semana son un patrón clásico de estructuración (smurfing o pitufeo): el cliente fracciona deliberadamente una suma mayor para no superar el umbral de reporte de operación relevante. Esto constituye una señal de alerta PLD/FT que debe escalarse al Oficial de Cumplimiento.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "GAFI Recomendación 3; DCG CNBV; Guía CNBV Señales de Alerta"
  },
  {
    pregunta: "CASO PRÁCTICO: Un cliente nuevo se presenta en una sucursal bancaria solicitando abrir una cuenta y depositar $300,000 en efectivo con billetes de alta denominación, sin poder justificar el origen de los fondos. ¿Cuál es la acción correcta del ejecutivo de cuenta?",
    opciones: [
      "Aceptar el depósito y generar únicamente un Reporte de Operación Relevante por superar el umbral",
      "Aplicar debida diligencia reforzada, solicitar documentación que acredite el origen lícito de los fondos y, de no obtenerse, escalar al Oficial de Cumplimiento para evaluar presentar un ROS",
      "Rechazar automáticamente la apertura de cuenta sin necesidad de documentar la situación",
      "Solicitar una segunda identificación oficial y proceder con la apertura si la documentación es válida"
    ],
    respuesta_correcta: 1,
    explicacion: "La incapacidad de justificar el origen de fondos es una señal de alerta PLD/FT. El ejecutivo debe aplicar debida diligencia reforzada, requerir documentación probatoria del origen lícito y, si no se obtiene satisfacción, escalar al Oficial de Cumplimiento. Generar únicamente un ROR sin investigar no es suficiente.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "DCG CNBV; GAFI Recomendación 10; Guía CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO: Un empleado de back-office bancario nota que su colega del área de operaciones, que gana $18,000 mensuales, recientemente adquirió un automóvil de lujo de $900,000 y viaja constantemente al extranjero. ¿Qué principio PLD/FT aplica y cuál es la acción correcta?",
    opciones: [
      "El principio de perfil transaccional del cliente; debe analizarse si las operaciones del colega en sus cuentas bancarias son consistentes",
      "La política de confidencialidad; el empleado no debe comentar las finanzas personales de sus compañeros",
      "El principio Conozca a su Empleado (KYE); el empleado debe reportar la situación al canal de denuncia interna o al Oficial de Cumplimiento",
      "El principio de debida diligencia simplificada; los empleados de confianza tienen menor riesgo PLD/FT"
    ],
    respuesta_correcta: 2,
    explicacion: "El principio KYE (Know Your Employee) aplica cuando un empleado muestra un nivel de vida inconsistente con su salario. Esto puede indicar corrupción, complicidad interna en lavado de dinero o acceso ilícito a recursos. El observador debe reportarlo al canal de denuncia interna sin dilación.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "Principios Wolfsberg KYE; Guía CNBV; DCG CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO: Una empresa constituida hace 3 meses, sin historial comercial ni empleados registrados ante el IMSS, solicita abrir una cuenta empresarial y realiza de inmediato depósitos por $5 millones en efectivo. ¿Qué señal de alerta y etapa del lavado podría indicar?",
    opciones: [
      "Señal de clientes VIP de reciente incorporación; no representa alerta PLD significativa",
      "Señal de debida diligencia simplificada aplicable a empresas nuevas sin historial de riesgo",
      "Señal de integración; la empresa usa sus propias utilidades para reinvertir en su propio negocio",
      "Posible empresa de fachada utilizada como vehículo de colocación; la ausencia de actividad comercial real es incompatible con el volumen de efectivo depositado"
    ],
    respuesta_correcta: 3,
    explicacion: "Una empresa recién constituida sin actividad comercial demostrable que mueve grandes sumas en efectivo es un indicador clásico de empresa de fachada (shell company) en la etapa de colocación del lavado de dinero. El Oficial de Cumplimiento debe aplicar debida diligencia reforzada e investigar el beneficiario final real.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "GAFI Recomendación 24; DCG CNBV; Guía CNBV Señales de Alerta"
  },
  {
    pregunta: "CASO PRÁCTICO: Un cliente que se identifica como diputado federal solicita abrir una cuenta de inversión para depositar sus prestaciones laborales. ¿Qué nivel de debida diligencia debe aplicar la institución financiera?",
    opciones: [
      "Debida diligencia reforzada (EDD) obligatoria por ser una Persona Políticamente Expuesta (PEP), con aprobación de un nivel directivo superior",
      "Debida diligencia estándar; los funcionarios públicos gozan de mayor confianza institucional",
      "Debida diligencia simplificada; los servidores públicos tienen menor perfil de riesgo por estar sujetos a declaración patrimonial",
      "No aplica ninguna diligencia especial; solo se requiere identificación oficial vigente"
    ],
    respuesta_correcta: 0,
    explicacion: "Los funcionarios públicos de alto nivel son considerados PEPs por el GAFI (Recomendación 12) y las DCG de la CNBV. La debida diligencia reforzada es obligatoria: requiere investigación del origen de fondos, aprobación de un nivel directivo superior y monitoreo permanente de la relación comercial.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "GAFI Recomendación 12; DCG CNBV; LFPIORPI Art. 18"
  },
  {
    pregunta: "CASO PRÁCTICO: Un cliente que durante 3 años realizó operaciones promedio de $20,000 mensuales súbitamente retira $800,000 en efectivo en una sola visita, argumentando que necesita el dinero para un viaje de negocios. ¿Qué debe hacer el ejecutivo de cuenta?",
    opciones: [
      "Autorizar el retiro inmediatamente; el cliente tiene derecho a disponer de su propio dinero",
      "Analizar si el movimiento corresponde al perfil transaccional histórico del cliente; al ser inconsistente, debe escalar al Oficial de Cumplimiento para determinar si procede un ROS",
      "Solicitar una identificación adicional y proceder con el retiro si la documentación está en orden",
      "Rechazar el retiro en efectivo y ofrecer únicamente transferencia electrónica como alternativa"
    ],
    respuesta_correcta: 1,
    explicacion: "Una desviación drástica del perfil transaccional histórico es una señal de alerta PLD/FT. El ejecutivo no debe simplemente procesar la operación; debe documentar la situación, verificar la justificación del cliente y escalar al Oficial de Cumplimiento si el origen o propósito de los fondos no se puede acreditar satisfactoriamente.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "DCG CNBV; GAFI Recomendación 20; Guía CNBV Señales de Alerta"
  },
  {
    pregunta: "CASO PRÁCTICO: Un cliente solicita al ejecutivo que divida una transferencia internacional de $60,000 USD en seis transferencias de $10,000 USD cada una para enviarlas el mismo día. ¿Cómo se denomina esta técnica y cuál es la acción correcta?",
    opciones: [
      "Diversificación de riesgos; es una práctica financiera legítima sin implicaciones PLD/FT",
      "Cobertura de divisas; requiere solo documentar el tipo de cambio aplicado",
      "Estructuración o fraccionamiento de operaciones; el ejecutivo debe negarse a ejecutar la instrucción y reportar la situación al Oficial de Cumplimiento",
      "Distribución de remesas; aplica procedimiento estándar de identificación del beneficiario"
    ],
    respuesta_correcta: 2,
    explicacion: "Dividir deliberadamente una operación en partes menores para evitar umbrales de reporte o controles es estructuración, independientemente de que las partes individuales sean de montos legales. El ejecutivo tiene la obligación de no ejecutar la instrucción y reportarla al Oficial de Cumplimiento.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "GAFI Recomendación 3; DCG CNBV; Guía CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO: Una casa de cambio recibe frecuentemente grandes volúmenes de billetes en dólares de baja denominación (billetes de $1, $5 y $10 USD) de un cliente que dice ser propietario de una tienda de abarrotes. ¿En qué etapa del lavado de dinero encaja este patrón?",
    opciones: [
      "Integración; el cliente convierte las ganancias del comercio en moneda extranjera para reinvertirlas",
      "Estratificación; los billetes de baja denominación dificultan el rastreo de las operaciones",
      "Dispersión; el cliente distribuye los fondos entre múltiples cuentas para evitar detección",
      "Colocación; los billetes de baja denominación en grandes volúmenes son característicos de ingresos de actividades delictivas como narcotráfico que se introducen al sistema financiero"
    ],
    respuesta_correcta: 3,
    explicacion: "Los grandes volúmenes de billetes de baja denominación son una señal clásica de colocación (placement): el dinero en efectivo proveniente de actividades ilícitas (especialmente narcotráfico) se introduce al sistema financiero. El perfil del cliente (tienda de abarrotes) no justifica ese volumen en esas denominaciones.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "Guía CNBV Tipologías; GAFI Recomendación 22; DCG CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO: Un notario está formalizando la compraventa de un inmueble valorado en $4 millones de pesos, y el comprador desea pagar el total en efectivo. ¿Qué obligación tiene el notario bajo la LFPIORPI?",
    opciones: [
      "Presentar un aviso ante la UIF a través del sistema SICOREPROS, ya que la operación supera el umbral establecido en el Art. 17 de la LFPIORPI para actividades vulnerables",
      "Solo verificar la identificación oficial del comprador y conservar una copia en el expediente notarial",
      "Reportar únicamente si el comprador no puede identificarse plenamente con documentación oficial",
      "No tiene obligación PLD/FT específica; solo aplica la legislación fiscal sobre declaración de efectivo"
    ],
    respuesta_correcta: 0,
    explicacion: "El Art. 17 de la LFPIORPI incluye la transmisión o constitución de derechos reales sobre inmuebles como actividad vulnerable. Los notarios deben presentar avisos ante la UIF vía SICOREPROS cuando el pago supera los umbrales establecidos, especialmente en operaciones con efectivo. Es una obligación de la Ley Anti-Lavado.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "LFPIORPI Art. 17 Fracc. XIV; Art. 18"
  },
  {
    pregunta: "CASO PRÁCTICO: El banco beneficiario mexicano recibe una transferencia internacional de $150,000 USD proveniente de un banco corresponsal europeo, pero los datos del ordenante están incompletos: falta nombre, dirección y número de cuenta. ¿Qué debe hacer el banco mexicano?",
    opciones: [
      "Acreditar los fondos de inmediato ya que la responsabilidad de la información es del banco ordenante",
      "Solicitar al banco corresponsal la información faltante del ordenante y, si no se obtiene o la situación es recurrente, considerar rechazar la transferencia o terminar la relación de corresponsalía, conforme a GAFI Recomendación 16",
      "Aceptar la transferencia y generar solo un ROR por superar el umbral de $10,000 USD",
      "Devolver automáticamente los fondos al banco origen sin investigación adicional"
    ],
    respuesta_correcta: 1,
    explicacion: "La Recomendación 16 del GAFI (Travel Rule) exige que las transferencias internacionales incluyan información completa del ordenante y el beneficiario. Ante información incompleta, el banco beneficiario debe solicitar los datos faltantes y, si la situación es recurrente, puede terminar la relación de corresponsalía.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "fácil",
    fuente: "GAFI Recomendación 16; DCG CNBV; Principios Wolfsberg Corresponsalía"
  },
  {
    pregunta: "CASO PRÁCTICO: Un cliente con perfil de pequeño comerciante de abarrotes realiza 12 transferencias internacionales de $15,000 USD cada una a diferentes cuentas en un país identificado en lista gris del GAFI, durante el mismo mes. ¿Cuál es la secuencia de acciones correcta del Oficial de Cumplimiento?",
    opciones: [
      "Solicitar al cliente que justifique solo las transferencias que superen $20,000 USD individualmente",
      "Bloquear las transferencias automáticamente por involucrar un país de lista gris sin mayor análisis",
      "Investigar si el patrón es consistente con el perfil comercial del cliente; al ser inconsistente, documentar el análisis y evaluar presentar un ROS ante la UIF con la evidencia recabada",
      "Cancelar la cuenta del cliente de inmediato ya que las transferencias a lista gris están prohibidas"
    ],
    respuesta_correcta: 2,
    explicacion: "El análisis debe ser basado en riesgo: las 12 transferencias a un país de lista gris son inconsistentes con el perfil de un pequeño comerciante. El Oficial de Cumplimiento debe documentar el análisis de inconsistencia con el perfil, recabar explicaciones del cliente y, si no son satisfactorias, presentar el ROS con todos los elementos de hecho.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "GAFI Recomendación 19, 20; DCG CNBV; Guía CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO: El director regional de un banco presiona al ejecutivo de cuenta para que apruebe sin completar el expediente KYC a un cliente calificado como VIP, argumentando que el cliente generará $3 millones en comisiones anuales. ¿Cuál es la obligación del ejecutivo?",
    opciones: [
      "Aplicar un KYC simplificado dado que el cliente VIP representa bajo riesgo comercial para la institución",
      "Completar el proceso de debida diligencia según los requisitos normativos, independientemente de la presión comercial, y escalar al Oficial de Cumplimiento si la presión persiste",
      "Solicitar al director regional la instrucción por escrito para quedar exento de responsabilidad personal",
      "Aprobar la cuenta condicionada a que el cliente entregue la documentación faltante en un plazo de 90 días"
    ],
    respuesta_correcta: 3,
    explicacion: "Las obligaciones de KYC son de orden público y no admiten excepciones por la rentabilidad del cliente. El ejecutivo debe completar el expediente según los requisitos normativos. Si recibe presión reiterada del director regional, debe escalarla al Oficial de Cumplimiento, ya que la presión institucional no exime de responsabilidad individual.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "DCG CNBV; GAFI Recomendación 10; LIC Art. 115"
  },
  {
    pregunta: "CASO PRÁCTICO: Durante una auditoría interna se detecta que el Oficial de Cumplimiento aprobó y envió 20 Reportes de Operaciones Sospechosas en el último año sin contar con el análisis documental de respaldo exigido por las DCG de la CNBV. ¿Cuál es la consecuencia regulatoria más probable?",
    opciones: [
      "Sanción a la institución por deficiencias en el proceso de generación de ROS e inhabilitación del Oficial de Cumplimiento por incumplimiento de las DCG de la CNBV",
      "Solo una observación menor en el informe de auditoría ya que los ROS sí fueron presentados oportunamente",
      "El regulador felicitará a la institución por el número de ROS presentados independientemente de su calidad",
      "La sanción recaerá únicamente sobre el auditor interno que no detectó la deficiencia en tiempo"
    ],
    respuesta_correcta: 0,
    explicacion: "Las DCG de la CNBV exigen que los ROS estén sustentados con análisis documental. Presentar reportes sin respaldo suficiente constituye un incumplimiento normativo formal que puede resultar en sanciones a la institución y en medidas disciplinarias para el Oficial de Cumplimiento, incluyendo inhabilitación.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "DCG CNBV; LIC Art. 108-115; GAFI Recomendación 20"
  },
  {
    pregunta: "CASO PRÁCTICO: Una casa de cambio recibe a un cliente que presenta $200,000 USD en billetes mixtos para cambio a pesos, diciendo ser un comerciante importador, pero no presenta ningún documento que respalde su actividad comercial ni el origen de los fondos. ¿Cuál es la secuencia correcta de acciones?",
    opciones: [
      "Realizar el cambio y generar únicamente un Reporte de Operación Relevante por superar los $10,000 USD",
      "Aplicar debida diligencia reforzada, solicitar documentación que acredite la actividad comercial y el origen de fondos y, si no se obtiene satisfacción, rechazar la operación y evaluar presentar un ROS",
      "Realizar el cambio en partes menores para no generar un solo reporte de operación relevante",
      "Solicitar identificación oficial y realizar el cambio si el cliente puede identificarse plenamente"
    ],
    respuesta_correcta: 1,
    explicacion: "$200,000 USD en efectivo sin documentación de origen es una señal de alerta de alto riesgo. La debida diligencia reforzada exige documentar el origen de fondos. Si el cliente no puede acreditarlo, la casa de cambio debe rechazar la operación y evaluar presentar un ROS, independientemente de perder el negocio.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "GAFI Recomendación 10; DCG CNBV; LFPIORPI Art. 17"
  },
  {
    pregunta: "CASO PRÁCTICO: Un banco corresponsal extranjero envía una comunicación informal al Oficial de Cumplimiento del banco mexicano solicitando que ciertas transacciones de un cliente en común no sean reportadas a la UIF. ¿Cuál es la acción correcta del banco mexicano?",
    opciones: [
      "Evaluar la solicitud caso por caso dependiendo del monto de las transacciones involucradas",
      "Aceptar si el banco corresponsal tiene mayor calificación crediticia y reputación que el banco mexicano",
      "Negarse categóricamente, documentar la solicitud como indicio de irregularidad y evaluar la viabilidad de mantener la relación de corresponsalía, reportando la situación al Oficial de Cumplimiento y al Consejo",
      "Solicitar la instrucción por escrito y esperar confirmación formal antes de decidir cómo proceder"
    ],
    respuesta_correcta: 2,
    explicacion: "Una solicitud de omitir reportes PLD/FT es una señal de alerta gravísima sobre el banco corresponsal. El banco mexicano debe negarse, documentar la comunicación, evaluar la terminación de la relación de corresponsalía por riesgo reputacional y regulatorio, y reportar internamente la situación.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "GAFI Recomendación 13, 19; Principios Wolfsberg Corresponsalía; DCG CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO: Un cliente solicita un préstamo de $8 millones de pesos con garantía hipotecaria de un inmueble, presentando una valuación de $12 millones. Sin embargo, el análisis comparativo de mercado indica que el inmueble real vale alrededor de $5 millones. ¿Qué tipología podría representar este caso?",
    opciones: [
      "Una operación rutinaria de crédito hipotecario que solo requiere revisión documental estándar",
      "Un caso de debida diligencia simplificada aplicable a clientes con historial crediticio limpio",
      "Un caso de fraude financiero simple sin implicaciones PLD/FT para la institución",
      "Posible loan-back con inmueble sobrevalorado, una tipología de lavado que combina fraude en valuación con introducción de recursos ilícitos al sistema financiero formal"
    ],
    respuesta_correcta: 3,
    explicacion: "El loan-back con inmueble sobrevalorado es una tipología reconocida: el lavador infla artificialmente el valor del activo para obtener un préstamo por encima del valor real, que luego repaga con recursos ilícitos. La discrepancia entre la valuación presentada y el valor de mercado es una señal de alerta que debe investigarse.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "Guía CNBV Tipologías; GAFI Tipologías de Bienes Raíces"
  },
  {
    pregunta: "CASO PRÁCTICO: Una empresa constructora con 10 años de antigüedad en la institución deposita sumas mensuales en efectivo de $4 millones, pero sus contratos registrados ante el IMSS y el SAT solo justifican ingresos de $800,000 mensuales. El Oficial de Cumplimiento recibe presión de la dirección para no investigar la discrepancia por la antigüedad del cliente. ¿Qué debe hacer?",
    opciones: [
      "Investigar la discrepancia de manera objetiva e independiente, sin considerar la antigüedad como justificación para omitir el análisis; si la discrepancia no se explica satisfactoriamente, presentar el ROS",
      "Dar al cliente un plazo de 90 días para regularizar su documentación antes de decidir si reporta",
      "Escalar al Consejo de Administración para que sea este quien decida si se investiga al cliente",
      "Aplicar debida diligencia simplificada por la antigüedad del cliente y documentar solo los depósitos actuales"
    ],
    respuesta_correcta: 0,
    explicacion: "La antigüedad del cliente no justifica omitir una investigación ante una discrepancia de 5 veces entre los ingresos declarados y los depósitos reales. El Oficial de Cumplimiento debe actuar con independencia ante la presión de la dirección, investigar objetivamente y presentar el ROS si la discrepancia no tiene explicación lícita.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "DCG CNBV; GAFI Recomendación 20; LIC Art. 115"
  },
  {
    pregunta: "CASO PRÁCTICO: Un empleado de ventanilla detecta que el mismo cliente ha realizado 8 depósitos en efectivo de $9,500 pesos en 4 sucursales distintas durante la misma semana, acumulando $76,000. El cliente justifica los depósitos como ventas de su negocio de ropa. ¿Cuál es la acción más adecuada?",
    opciones: [
      "Aceptar la justificación del cliente ya que $9,500 por operación no supera ningún umbral individual de reporte",
      "Reportar de inmediato al Oficial de Cumplimiento el patrón detectado, ya que los 8 depósitos en múltiples sucursales en una semana constituyen un patrón clásico de estructuración que debe analizarse integralmente",
      "Solicitar al cliente sus estados financieros del negocio de ropa para verificar la consistencia de las ventas",
      "Generar un ROR por el monto acumulado semanal ya que supera el umbral de $10,000 USD equivalente"
    ],
    respuesta_correcta: 1,
    explicacion: "El patrón de múltiples depósitos en distintas sucursales, justo por debajo de un umbral y en corto tiempo, es la definición de estructuración. Aunque cada depósito individualmente no supere el umbral, el patrón integral es la señal de alerta. El empleado debe reportarlo al Oficial de Cumplimiento sin demora.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "DCG CNBV; Guía CNBV; GAFI Recomendación 3 y 20"
  },
  {
    pregunta: "CASO PRÁCTICO: Una empresa de exportación de artesanías emite facturas a un comprador en Europa por $500,000 USD por un lote que, según precios de mercado internacional, no debería valer más de $80,000 USD. ¿Qué tipología de lavado de dinero describe este caso?",
    opciones: [
      "Colocación de recursos mediante el sistema de comercio exterior",
      "Estratificación mediante instrumentos financieros complejos transfronterizos",
      "Sobrefacturación de exportaciones, un indicador típico del Lavado de Dinero Basado en Comercio (TBML), que permite transferir valor ilícito disfrazado de transacciones comerciales legítimas",
      "Integración de recursos mediante reinversión en empresas del sector exportador"
    ],
    respuesta_correcta: 2,
    explicacion: "La sobrefacturación de exportaciones es uno de los cuatro indicadores principales del TBML (Trade-Based Money Laundering): el exportador factura más de lo que realmente vale la mercancía, permitiendo al comprador en el extranjero transferir valor ilícito hacia el exportador de manera aparentemente legítima.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "GAFI Informe TBML (2006, rev. 2020); Guía CNBV Tipologías"
  },
  {
    pregunta: "CASO PRÁCTICO: La auditoría interna detecta que el 40% del personal operativo de la institución no completó la capacitación PLD/FT obligatoria del ejercicio. El Oficial de Cumplimiento justifica la omisión por falta de presupuesto. ¿Cuál es la implicación regulatoria más grave?",
    opciones: [
      "Solo una observación en el informe de auditoría sin consecuencias regulatorias inmediatas",
      "Una penalización interna al área de recursos humanos responsable de la logística de capacitación",
      "Una reducción del presupuesto de capacitación para el siguiente ejercicio como medida correctiva",
      "Incumplimiento normativo de los requisitos de capacitación de las DCG de la CNBV, que puede resultar en sanciones al presentarse en la siguiente visita de supervisión; la falta de presupuesto no es eximente"
    ],
    respuesta_correcta: 3,
    explicacion: "Las DCG de la CNBV establecen la obligatoriedad de la capacitación PLD/FT para todo el personal. El incumplimiento es una deficiencia normativa formal sancionable, independientemente de la justificación presupuestal. La Alta Dirección debe garantizar los recursos para cumplir con las obligaciones regulatorias.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "DCG CNBV; LIC Art. 115; GAFI Recomendación 18"
  },
  {
    pregunta: "CASO PRÁCTICO: Un cliente nuevo de alto patrimonio solicita abrir una cuenta corporativa a nombre de una estructura con una sociedad holding en Islas Caimán, dos subsidiarias en Países Bajos y la sociedad operativa en México. El representante no puede identificar al beneficiario final real. ¿Cuál es la acción correcta?",
    opciones: [
      "Abrir la cuenta con la información disponible y requerir al cliente que complete el expediente dentro de los 90 días siguientes",
      "Aceptar la estructura como cliente ya que las Islas Caimán y Países Bajos son jurisdicciones reguladas internacionalmente",
      "Identificar al beneficiario final real antes de aprobar la apertura, aplicar debida diligencia reforzada a la estructura corporativa compleja e investigar el propósito legítimo antes de proceder",
      "Rechazar automáticamente cualquier cliente con estructura corporativa que incluya jurisdicciones offshore"
    ],
    respuesta_correcta: 2,
    explicacion: "La GAFI Recomendación 10 y 24 exigen identificar al beneficiario final real (UBO) antes de establecer la relación comercial, especialmente en estructuras corporativas complejas con jurisdicciones de alto riesgo. No identificar al UBO es un incumplimiento normativo grave; no se puede abrir la cuenta sin esta información.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "GAFI Recomendación 10, 24; DCG CNBV; LFPIORPI Art. 18"
  },
  {
    pregunta: "CASO PRÁCTICO: Después de que el Oficial de Cumplimiento presenta un ROS sobre la cuenta de un cliente, un gerente informa que dicho cliente preguntó directamente si la institución tenía alguna inquietud respecto a sus operaciones recientes. ¿Qué riesgo PLD/FT representa esta situación y cuál es la acción correcta?",
    opciones: [
      "Es una consulta normal del cliente; el gerente debe tranquilizarlo indicando que todo está en orden",
      "Existe un riesgo de tipping-off indirecto: el gerente, al comunicar la pregunta del cliente, puede haber revelado que existe un análisis en curso; debe escalarse al Oficial de Cumplimiento para evaluar si se violó el Art. 25 de la LFPIORPI",
      "El cliente tiene derecho a saber el estatus de su cuenta bajo la Ley de Protección al Consumidor",
      "Solo representa riesgo si el gerente respondió afirmativamente a la pregunta del cliente"
    ],
    respuesta_correcta: 1,
    explicacion: "El tipping-off puede ser directo o indirecto. Si el gerente respondió de cualquier manera que generara en el cliente la sospecha de que está siendo investigado, puede haber violado el Art. 25 de la LFPIORPI. El Oficial de Cumplimiento debe investigar qué se dijo exactamente y documentar el incidente.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "medio",
    fuente: "LFPIORPI Art. 25; GAFI Recomendación 21; DCG CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO COMPLEJO: Una empresa de factoraje recibe la cesión de cartera por $18 millones de pesos de una empresa importadora cuya contraparte en el extranjero está en un país en lista gris del GAFI. Toda la documentación legal está completa y en orden, pero los márgenes de utilidad reportados son 4 veces superiores al promedio del sector. ¿Cuál es el análisis correcto del Oficial de Cumplimiento?",
    opciones: [
      "Aprobar la operación ya que la documentación legal completa elimina el riesgo PLD/FT",
      "Rechazar automáticamente por involucrar a un país en lista gris sin análisis adicional",
      "A pesar de la documentación completa, los indicadores de riesgo residual (contraparte en lista gris, márgenes inconsistentes con el sector) justifican aplicar debida diligencia reforzada, solicitar justificación de márgenes y evaluar presentar un ROS si no se obtiene explicación satisfactoria",
      "Aprobar parcialmente la operación reteniendo el 20% como garantía contra riesgo PLD/FT"
    ],
    respuesta_correcta: 2,
    explicacion: "La documentación completa no elimina el riesgo PLD/FT. El enfoque basado en riesgos (EBR) exige ponderar todos los factores: la contraparte en lista gris activa la Recomendación 19 del GAFI, y los márgenes desproporcionados son indicadores de TBML. El Oficial debe aplicar EDD y documentar exhaustivamente su análisis.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "difícil",
    fuente: "GAFI Recomendación 1, 19, 20; Informe TBML GAFI; DCG CNBV"
  },
  {
    pregunta: "CASO PRÁCTICO COMPLEJO: Durante una visita de supervisión, la CNBV detecta en una institución financiera: (1) matriz de riesgo no actualizada desde hace 2 años, (2) 35% de expedientes de clientes de alto riesgo desactualizados, y (3) ausencia de programa de auditoría interna PLD documentado para el ejercicio en curso. ¿Cuál es la consecuencia regulatoria más probable?",
    opciones: [
      "Solo se levantará un acta de observaciones sin consecuencias económicas por ser la primera visita",
      "El regulador dará un plazo de 180 días para corregir todas las deficiencias sin sanciones económicas",
      "La CNBV solo sancionará la deficiencia más grave de las tres identificadas para no duplicar sanciones",
      "Múltiples sanciones acumuladas por cada incumplimiento a las DCG-CNBV, posible plan de remediación supervisado, potencial inhabilitación de directivos responsables y riesgo de intervención gerencial si persisten las deficiencias"
    ],
    respuesta_correcta: 3,
    explicacion: "Cada deficiencia detectada constituye un incumplimiento independiente a las DCG de la CNBV: la matriz de riesgo desactualizada, los expedientes incompletos y la falta de auditoría interna son obligaciones autónomas. Las sanciones pueden acumularse. Ante deficiencias graves y reiteradas, la CNBV puede escalar a medidas más severas.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "difícil",
    fuente: "DCG CNBV; LIC Art. 108-115; GAFI IO3"
  },
  {
    pregunta: "CASO PRÁCTICO INTEGRADO: El Oficial de Cumplimiento recibe simultáneamente: (a) instrucción del CEO de no reportar a un cliente VIP bajo ningún concepto, (b) presión del director comercial argumentando pérdida de $3 millones en ingresos, y (c) un memo del área legal indicando que existe ambigüedad normativa sobre si los indicios son suficientes para un ROS. ¿Cuál es la decisión correcta, integrando criterios éticos, legales y de gestión de riesgo?",
    opciones: [
      "Aplicar el criterio conservador del enfoque basado en riesgo: si existen indicios razonables, reportar; documentar todas las presiones recibidas, presentar el ROS fundamentado y escalar al Consejo de Administración la situación de presiones indebidas",
      "Seguir el criterio del área legal; si hay ambigüedad normativa, no existe obligación de reportar hasta que se aclare",
      "Priorizar la decisión del CEO ya que es la máxima autoridad ejecutiva y asumir que la responsabilidad recaerá sobre él",
      "Posponer la decisión 30 días para recabar más evidencia que despeje la ambigüedad normativa señalada"
    ],
    respuesta_correcta: 0,
    explicacion: "Este caso integra los principios fundamentales del PLD/FT: (1) ante indicios razonables, el criterio conservador es reportar; (2) la obligación de reportar es personal e indelegable para el Oficial; (3) la presión del CEO y el área comercial son presiones indebidas que deben documentarse; (4) la ambigüedad no es excusa. El Oficial debe reportar y escalar las presiones al Consejo.",
    tema: "Casos Prácticos Aplicados",
    dificultad: "difícil",
    fuente: "DCG CNBV; LIC Art. 115; LFPIORPI Art. 18; GAFI Recomendaciones 1, 20"
  }
];
