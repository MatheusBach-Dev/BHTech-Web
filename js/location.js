const unidades = {
    'bh': {
        endereco: 'R. Contagem, 920 - Santa Ines, Belo Horizonte - MG, 31070-065',
        horario: ' Seg. a Sex. das 09h às 19h | Sáb. das 09h às 17h | Dom. das 09h às 12h.',
        mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.924956588191!2d-43.90887262399214!3d-19.885390436922453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa69b7daedb6479%3A0xca187334388290a0!2sBH%20Celular!5e0!3m2!1spt-BR!2sbr!4v1778904594997!5m2!1spt-BR!2sbr'
    },
    'guanhaes': {
        endereco: 'Av. Gov. Milton Campos, 2783 - Guanhães, MG, 39740-000',
        horario: 'Seg. a Sex. das 08h às 18h | Sáb. das 08h às 12h.',
        mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3777.4865016131225!2d-42.93991212401998!3d-18.77646020342854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xafb5fc15af09f3%3A0xba80dcd64faef1ed!2sBH%20Celular!5e0!3m2!1spt-BR!2sbr!4v1778902928866!5m2!1spt-BR!2sbr'

    },
    'itamarandiba': {
        endereco: 'Itamarandiba, MG, 39670-000',
        horario: 'Seg. a Sex. das 08h às 18h | Sáb. das 08h às 12h..',
        mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3797.6423026329594!2d-42.86066322404191!3d-17.855395477075067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xad957bec5cf9db%3A0x267c78fafc63ff10!2sBH%20CELULAR!5e0!3m2!1spt-BR!2sbr!4v1778902890753!5m2!1spt-BR!2sbr'
    },
    'pecanha': {
        endereco: 'R. Raimundo Alvarenga - Centro, Peçanha - MG, 39700-000',
        horario: 'Seg. a Sex. das 08h às 18h | Sáb. das 08h às 12h.',
        mapa: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.5891496760664!2d-42.563637114764944!3d-18.547459351744113!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xae1f6030230acd%3A0x6e7838bf0d0b5dc3!2sBH%20celular!5e0!3m2!1spt-BR!2sbr!4v1778902827344!5m2!1spt-BR!2sbr'
    }
}

const select = document.getElementById('regiao-select');
select.addEventListener('change', function() {
    let regiao = select.value;
    let info = unidades[regiao];


if (info) {
        document.getElementById("endereco-p").innerHTML = info.endereco;
        document.getElementById("horario-p").innerHTML = info.horario; 
        document.getElementById("mapa-iframe").src = info.mapa;
    }
});
