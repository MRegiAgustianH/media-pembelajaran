import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { startQuiz } from './quiz.js';


// --- Sistem Audio ---
export const audioSys = {
    bgm: new Audio('https://upload.wikimedia.org/wikipedia/commons/4/4e/Kevin_MacLeod_-_Carefree.ogg'),
    click: new Audio('https://upload.wikimedia.org/wikipedia/commons/4/43/Beep_beep.ogg'),
    isMuted: false,
    init: function() {
        this.bgm.loop = true;
        this.bgm.volume = 0.3;
        this.click.volume = 0.6;
    },
    playBgm: function() {
        if (!this.isMuted && this.bgm.paused) {
            this.bgm.play().catch(e => console.log("Audio di-block browser hingga interaksi"));
        }
    },
    playClick: function() {
        if (!this.isMuted) {
            this.click.currentTime = 0;
            this.click.play().catch(e => {});
        }
    },
    toggleMute: function() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.bgm.pause();
        } else {
            this.bgm.play().catch(e => {});
        }
        return this.isMuted;
    }
};
audioSys.init();

const btnAudioToggle = document.getElementById('btn-audio-toggle');
btnAudioToggle.addEventListener('click', () => {
    const muted = audioSys.toggleMute();
    btnAudioToggle.textContent = muted ? '🔇 Musik: OFF' : '🔊 Musik: ON';
    btnAudioToggle.style.backgroundColor = muted ? '#e63946' : '#2a9d8f';
});

const uiHome = document.getElementById('home-screen');
const uiExplore = document.getElementById('explore-screen');
const uiQuiz = document.getElementById('quiz-screen');
const uiResult = document.getElementById('result-screen');
const infoPanel = document.getElementById('info-panel');

const btnExplore = document.getElementById('btn-explore');
const btnQuiz = document.getElementById('btn-quiz');
const btnBackHome = document.getElementById('btn-back-home');
const btnBackHomeQuiz = document.getElementById('btn-back-home-quiz');
const btnBackHomeResult = document.getElementById('btn-back-home-result');
const btnCloseInfo = document.getElementById('btn-close-info');

let isExploreMode = false;

function showScreen(screenEl) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screenEl.classList.add('active');
    isExploreMode = (screenEl === uiExplore);
}

btnExplore.addEventListener('click', () => { 
    audioSys.playClick(); 
    audioSys.playBgm(); 
    showScreen(uiExplore); 
});
btnQuiz.addEventListener('click', () => {
    audioSys.playClick();
    audioSys.playBgm();
    startQuiz();
});
btnBackHome.addEventListener('click', () => { audioSys.playClick(); showScreen(uiHome); });
btnBackHomeQuiz.addEventListener('click', () => { audioSys.playClick(); showScreen(uiHome); });
btnBackHomeResult.addEventListener('click', () => { audioSys.playClick(); showScreen(uiHome); });
btnCloseInfo.addEventListener('click', () => {
    infoPanel.classList.add('hidden');
    audioSys.playClick();
});

// --- Three.js Setup ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0d1b2a, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 30;
controls.minDistance = 5;

// Lighting untuk Pembelajaran (Pewarnaan Merah/Biru)
// Hemisphere light memberi gradasi merah di atas dan biru di bawah
const hemiLight = new THREE.HemisphereLight(0xff8888, 0x4444ff, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 5, 10);
scene.add(dirLight);

const interactableObjects = [];
const heartGroup = new THREE.Group();
heartGroup.userData = { 
    name: "Jantung", 
    desc: "Organ berotot yang memompa darah. Berdetak dalam ritme 'Lub-Dub'. Memiliki 4 ruang: serambi kanan & kiri (menerima darah), bilik kanan & kiri (memompa darah)."
};

// Data titik interaktif (Hotspots) berdasarkan warna edukasi (Merah=Kaya O2, Biru=Kaya CO2)
const hotspotsData = [
    { pos: new THREE.Vector3(-4, 4.2, -1.2), name: "Aorta", desc: "Pembuluh nadi (arteri) terbesar. Mengalirkan darah bersih (kaya oksigen) dari bilik kiri ke seluruh tubuh.", colorHex: 0xff3333, uiColor: '#e63946' },
    { pos: new THREE.Vector3(-3.4, 7.6, 2.6), name: "Lengkung Aorta", desc: "Bagian melengkung dari aorta tepat di atas jantung sebelum percabangan ke kepala dan lengan.", colorHex: 0xff3333, uiColor: '#e63946' },
    { pos: new THREE.Vector3(-4.2, 0.8, 3.4), name: "Serambi (Atrium) Kiri", desc: "Ruang penerima. Menerima darah bersih yang baru saja mengikat oksigen dari paru-paru.", colorHex: 0xff3333, uiColor: '#e63946' },
    { pos: new THREE.Vector3(1, 2.4, 6), name: "Vena Pulmonalis", desc: "Satu-satunya vena yang membawa darah bersih (kaya oksigen) dari paru-paru kembali ke serambi kiri jantung.", colorHex: 0xff3333, uiColor: '#e63946' },

    { pos: new THREE.Vector3(-5, 3.2, 1.4), name: "Arteri Pulmonalis", desc: "Satu-satunya arteri yang membawa darah kotor (banyak karbon dioksida) dari bilik kanan menuju paru-paru.", colorHex: 0x3366ff, uiColor: '#457b9d' },
    { pos: new THREE.Vector3(-1, 6, -5), name: "Vena Cava Superior", desc: "Pembuluh balik besar yang membawa masuk darah kotor dari tubuh bagian atas kembali ke serambi kanan.", colorHex: 0x3366ff, uiColor: '#457b9d' }
];


// Objek wrapper agar jantung dapat diputar dari poros tengah
const heartWrapper = new THREE.Group();
heartWrapper.add(heartGroup);
scene.add(heartWrapper);

let loadedParts = 0;

function checkLoadComplete() {
    loadedParts++;
    if (loadedParts === 2) {
        // Pasang Hotspot Interaktif ke dalam heartGroup
        const hotspotGeo = new THREE.SphereGeometry(1.5, 32, 32);
        hotspotsData.forEach(data => {
            const hotspotMat = new THREE.MeshBasicMaterial({ 
                color: data.colorHex, 
                transparent: true, 
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const marker = new THREE.Mesh(hotspotGeo, hotspotMat);
            marker.position.copy(data.pos);
            // Simpan data tambahan untuk UI dan penanda animasi
            marker.userData = { name: data.name, desc: data.desc, color: data.uiColor, isHotspot: true };
            heartGroup.add(marker);
            interactableObjects.push(marker);
        });

        // Hitung batas (Bounding Box) dari keseluruhan jantung
        const box = new THREE.Box3().setFromObject(heartGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Geser poros heartGroup agar berada tepat di tengah (0,0,0) lokal
        heartGroup.position.x = -center.x;
        heartGroup.position.y = -center.y;
        heartGroup.position.z = -center.z;
        
        // Skalakan wrapper agar ukuran maksimal di layar membesar secara signifikan (dari 8 ke 15)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 15 / maxDim;
        heartWrapper.scale.set(scale, scale, scale);
        
        // Simpan wrapper di object window atau global agar bisa dianimasikan
        window.heartWrapper = heartWrapper;
    }
}

// --- Load Realistic Heart from Reference ---
const mtlLoader = new MTLLoader();
mtlLoader.setPath('assets/models/');

mtlLoader.load('heart-back.mtl', (materialsBack) => {
    materialsBack.preload();
    const objLoaderBack = new OBJLoader();
    objLoaderBack.setMaterials(materialsBack);
    objLoaderBack.setPath('assets/models/');
    objLoaderBack.load('heart-back.obj', (heartBack) => {
        // Posisi default
        heartBack.position.set(32, -3, 3);
        heartBack.rotation.set(-1.6, 0, 0); // Sesuai dengan app.js (hanya X)
        
        heartBack.traverse((child) => {
            if (child.isMesh) {
                child.material.shininess = 50;
                interactableObjects.push(child);
                child.userData = heartGroup.userData;
            }
        });
        heartGroup.add(heartBack);
        checkLoadComplete();
    });
});

mtlLoader.load('heart-front.mtl', (materialsFront) => {
    materialsFront.preload();
    const objLoaderFront = new OBJLoader();
    objLoaderFront.setMaterials(materialsFront);
    objLoaderFront.setPath('assets/models/');
    objLoaderFront.load('heart-front.obj', (heartFront) => {
        // Posisi "Integrated" dari app.js
        heartFront.position.set(-7.6, -9.4, 24.2);
        heartFront.rotation.set(-1.6, 0.4, 0.05);
        heartFront.scale.set(4, 4, 4);
        
        heartFront.traverse((child) => {
            if (child.isMesh) {
                child.material.shininess = 50;
                interactableObjects.push(child);
                child.userData = heartGroup.userData;
            }
        });
        heartGroup.add(heartFront);
        checkLoadComplete();
    });
});


// --- Interaksi (Raycaster) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (!isExploreMode) return;

    // Cek apakah klik mengenai UI panel, jika ya abaikan
    if (event.target.closest('#info-panel') || event.target.closest('button')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        showInfo(object.userData.name, object.userData.desc, object.userData.color);
        
        // Highlight efek
        const origColor = object.material.color.getHex();
        object.material.color.setHex(0xffffff);
        setTimeout(() => {
            object.material.color.setHex(origColor);
        }, 150);
    }
});

function showInfo(title, desc, color) {
    const titleEl = document.getElementById('info-title');
    titleEl.textContent = title;
    titleEl.style.color = color || '#e63946'; // Gunakan warna default jika tidak ada
    
    document.getElementById('info-desc').textContent = desc;
    infoPanel.classList.remove('hidden');
}

// Hover effect (Cursor)
window.addEventListener('mousemove', (event) => {
    if (!isExploreMode) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.intersectObjects(interactableObjects).length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Animasi ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Detak Jantung (Ritme 'Lub-Dub')
    const beatTime = time % 1.2; // 1 siklus detak = 1.2 detik
    let scale = 1.0;
    
    if (beatTime < 0.15) {
        // Detak pertama (Lub - kontraksi bilik)
        scale = 1.0 + Math.sin(beatTime * Math.PI * (1/0.15)) * 0.15;
    } else if (beatTime > 0.3 && beatTime < 0.45) {
        // Detak kedua (Dub - penutupan katup)
        scale = 1.0 + Math.sin((beatTime - 0.3) * Math.PI * (1/0.15)) * 0.1;
    }
    
    // Terapkan efek squish dan rotasi pada wrapper utama
    if (window.heartWrapper) {
        // Kita simpan skala dasar di userData saat pertama kali di set
        if (!window.heartWrapper.userData.baseScale) {
            window.heartWrapper.userData.baseScale = window.heartWrapper.scale.x;
        }
        const base = window.heartWrapper.userData.baseScale;
        window.heartWrapper.scale.set(scale * base, (2 - scale) * base, scale * base);
        window.heartWrapper.rotation.y = time * 0.15; // Putar lebih pelan
        
        // Animasi Hotspot (berdenyut / pulsing)
        interactableObjects.forEach(obj => {
            if (obj.userData.isHotspot) {
                const pulse = 1 + Math.sin(time * 3) * 0.2; // Naik turun ukurannya
                obj.scale.set(pulse, pulse, pulse);
            }
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
