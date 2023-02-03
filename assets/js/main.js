let net;
const MAX_CLASS = 5;
const webcamElement = document.getElementById('webcam-input');
const classifier = knnClassifier.create();
const video = document.querySelector('#webcam-input');
const btn = document.querySelector('#toggle');
let tog = 0;

let numberOfActiveClasses = 2;
var colors = ['#2baa5e', '#c95ac5', '#EF880A', '#11598E', '#8EC640', '#029548', '#F8EC31', '#1875BC', '#FCBE2E', '#26B673', '#20A9E1', '#E5E5E5'];

async function app() 
{
    console.log('Loading Model (MobiNet)');
    net = await mobilenet.load();
    
    console.log('Successfully loaded model');
    $('#wait').modal('hide');

    const addExample = classId => {
        const activation = net.infer(webcamElement, 'conv_preds');
        classifier.addExample(activation, classId);
    };

    document.getElementById('btn-class-1').addEventListener('click', () => addExample(1));
    document.getElementById('btn-class-2').addEventListener('click', () => addExample(2));
    document.getElementById('btn-class-3').addEventListener('click', () => addExample(3));
    document.getElementById('btn-class-4').addEventListener('click', () => addExample(4));
    document.getElementById('btn-class-5').addEventListener('click', () => addExample(5));
    document.getElementById('download').addEventListener('click', () => download());
    document.getElementById('prog').addEventListener('click', () => download());
    document.getElementById('reset').addEventListener('click', () => reset());
    document.getElementById('cont').addEventListener('click', () => cont());
    document.getElementById('close').addEventListener('click', () => close_func());
    document.getElementById('toggle').addEventListener('click', () => toggle());
    document.querySelector("#cross-3").addEventListener('click', () => cross3());
    document.querySelector("#cross-4").addEventListener('click', () => cross4());
    document.querySelector("#cross-5").addEventListener('click', () => cross5());

    while (true) 
    {
        if (classifier.getNumClasses() > 0) 
        {
            const activation = net.infer(webcamElement, 'conv_preds');
            const result = await classifier.predictClass(activation, MAX_CLASS);
            con = result.confidences;
            $.each(result.confidences, function (index, element) 
            {
                $('#progress-bar-class-' + index).width((element * 100) + '%');
                $('#progress-bar-class-' + index).text((element * 100) + '%');
            });
        }
        await tf.nextFrame();
    }
}

async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                video: true
            },
                stream => {
                    webcamElement.srcObject = stream;
                    window.localStream = stream;
                    video.srcObject = stream;
                    webcamElement.addEventListener('loadeddata', () => resolve(), false);
                },
                error => reject());
        } else {
            reject();
        }

        tog = 1;
        var text = document.querySelector("#togtext");
        if (text) {
            text.textContent = "ON";
        }
    });
}

function closeWebcam() {
    localStream.getVideoTracks()[0].stop();
    video.src = '';
    tog = 0;
    var text = document.querySelector("#togtext");
    if (text) {
        text.textContent = "OFF";
    }
}

function toggle() {
    if (tog == 0) {
        setupWebcam();
    }

    else {
        closeWebcam();
    }
}

function cont() {
    $('#success').modal('hide');
}

async function download() {
    let samp_class = ['s1', 's2', 's3', 's4', 's5'];
    let flag = 0;
    for (let index = 0; index < numberOfActiveClasses; index++) {
        console.log(document.getElementById(samp_class[index]).textContent);
        if (document.getElementById(samp_class[index]).textContent == 0) {
            flag = 1;
        }
    }

    if (flag == 1) {
        alert("Error: Image classes are empty, The Model cannot be downloaded. Please fill the classes, to download.")
    }

    else {
        await net.model.save('downloads://my-model');
        $('#success').modal('show');
    }

}

function reset() 
{
    if (confirm("Are you sure you want to quit? (This will reset your progress)") == true) 
    {
        window.location.reload();
    } 
}

function close_func() 
{
    if (confirm("Are you sure you want to quit? (This will reset your progress)") == true) 
    {
        $('#success').modal('hide');
        window.location.reload();
    } 
}

function cross3 ()
{
    document.getElementById("card-3").style.display = "none";
    numberOfActiveClasses--;
}

function cross4 ()
{
    document.getElementById("card-4").style.display = "none";
    numberOfActiveClasses--;
}

function cross5 ()
{
    document.getElementById("card-5").style.display = "none";
    document.querySelector('.class-train-section').querySelector('.d-none').classList.add('d-none');
            document.querySelector('.output-section').querySelector('.d-none').classList.add('d-none');
    numberOfActiveClasses--;
}

$('#wait').modal('show');
app();

$(document).ready(function () {
    setupWebcam();

    $('.btn-train').each(function (index, valve) {
        $(this).css('background-color', colors[index]);
        $(this).css('border-color', colors[index]);
    });
    $('.progress-bar').each(function (index, valve) {
        $(this).css('background-color', colors[index]);
    });

    $('.btn-train').on('click', function (event) {
        samples = $(this).closest('.card-body').find('.samples')[0];
        c = samples.textContent; c++;
        samples.textContent = c;
    });

    $('.btn-add-class').on('click', function (event) {
        numberOfActiveClasses++;
        if (numberOfActiveClasses <= 5) {
            document.querySelector('.class-train-section').querySelector('.d-none').classList.remove('d-none');
            document.querySelector('.output-section').querySelector('.d-none').classList.remove('d-none');
        } else {
            alert('Maximum of 5 classes are allowed');
        }
    });

    $('.class-title').on('change', function (event) {
        val = $(this).val();
        $('#' + $(this).data('output-id')).html(val);
    });
});

