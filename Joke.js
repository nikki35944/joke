class Joke
{
    constructor() {
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.inactivityTimer = null;
        this.isStuck = false;
        this.gifs = [];


        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.updateStuckGifsPosition = this.updateStuckGifsPosition.bind(this);
    }

    init() {
        this.gifs = Array.from(document.getElementsByClassName('gif-image'));
        this.addEventListeners();
        this.resetTimer();
    }

    addEventListeners() {
        // Отслеживание движения мыши
        document.addEventListener('mousemove', this.handleMouseMove);
        // Cкрытие гифок
        document.addEventListener('contextmenu', this.handleContextMenu);
    }

    handleMouseMove(e) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;

        if (this.isStuck) {
            this.updateStuckGifsPosition();
        }

        this.resetTimer();
    }

    handleContextMenu(e) {
        this.hideAllGifs();
        this.isStuck = false;
    }

    resetTimer() {
        clearTimeout(this.inactivityTimer);
        if (!this.isStuck) {
            this.hideAllGifs();
            this.inactivityTimer = setTimeout(() => this.showFirstGif(), 100); // 180000 для 3 минут
        }
    }

    getRandomPosition(maxDistance) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * maxDistance;
        return {
            x: Math.cos(angle) * distance + this.lastMouseX,
            y: Math.sin(angle) * distance + this.lastMouseY
        };
    }

    showFirstGif() {
        const pos = this.getRandomPosition(600);
        this.showGif(0, pos.x, pos.y);
        setTimeout(() => this.showGif(1, this.getRandomPosition(600).x, this.getRandomPosition(600).y), 5000);
        setTimeout(() => this.showGif(2, this.getRandomPosition(600).x, this.getRandomPosition(600).y), 10000);
        setTimeout(() => this.moveGifsTowardsCursor(), 10000);
    }

    showGif(index, x, y) {
        const gif = this.gifs[index];
        gif.style.display = 'block';
        gif.style.left = `${x}px`;
        gif.style.top = `${y}px`;
    }

    moveGifsTowardsCursor() {
        const duration = 5000;
        const startTime = Date.now();
        const minDistance = 20;
        // Конечные позиции для всех гифок
        const targetPositions = [];

        this.gifs.forEach(() => {
            let newPos;
            let attempts = 0;

            do {
                const angle = Math.random() * 2 * Math.PI;
                const distance = 50 + (Math.random() * 20 - 10);

                newPos = {
                    x: this.lastMouseX + Math.cos(angle) * distance,
                    y: this.lastMouseY + Math.sin(angle) * distance
                };

                attempts++;
            } while (
                targetPositions.some(pos =>
                    Math.hypot(newPos.x - pos.x, newPos.y - pos.y) < minDistance
                ) &&
                attempts < 50
                );

            targetPositions.push(newPos);
        });

        const animate = () => {
            const currentTime = Date.now();
            const progress = (currentTime - startTime) / duration;

            if (progress >= 1) {
                this.isStuck = true;
                this.updateStuckGifsPosition();
                return;
            }

            this.gifs.forEach((gif, index) => {
                const startX = parseFloat(gif.style.left);
                const startY = parseFloat(gif.style.top);
                const targetX = targetPositions[index].x;
                const targetY = targetPositions[index].y;

                gif.style.left = `${startX + (targetX - startX) * progress}px`;
                gif.style.top = `${startY + (targetY - startY) * progress}px`;
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    updateStuckGifsPosition() {
        const minDistance = 20; // Минимальное расстояние между гифками
        const baseDistance = 50; // Базовое расстояние от курсора
        let positions = [];

        this.gifs.forEach((gif) => {
            let newPos;
            let attempts = 0;

            // Попытаться найти позицию, где гифка не пересекается с другими
            do {
                const angle = Math.random() * 2 * Math.PI;
                const distance = baseDistance + (Math.random() * 20 - 10);

                newPos = {
                    x: this.lastMouseX + Math.cos(angle) * distance,
                    y: this.lastMouseY + Math.sin(angle) * distance
                };

                attempts++;
            } while (
                // Проверить не слишком ли близко к другим гифкам
                positions.some(pos =>
                    Math.hypot(newPos.x - pos.x, newPos.y - pos.y) < minDistance
                ) &&
                attempts < 50
                );

            positions.push(newPos);

            gif.style.transition = 'left 0.3s, top 0.3s';
            gif.style.left = `${newPos.x}px`;
            gif.style.top = `${newPos.y}px`;
        });
    }

    hideAllGifs() {
        this.gifs.forEach(gif => gif.style.display = 'none');
    }
}