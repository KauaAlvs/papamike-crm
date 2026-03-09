import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, Save, RefreshCw, Type } from 'lucide-react';

const LousaDigital = ({ onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [mode, setMode] = useState('pen'); // 'pen' ou 'eraser'

    // Configura o Canvas ao montar
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fundo branco
    }, []);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = mode === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = mode === 'eraser' ? 20 : lineWidth;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
    };

    const getCoordinates = (e) => {
        if (e.touches) {
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    };

    const handleSave = () => {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onSave(dataUrl);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
            {/* Barra de Ferramentas */}
            <div style={{ display: 'flex', gap: '10px', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '12px', alignItems: 'center' }}>
                <button onClick={() => setMode('pen')} style={{ padding: '8px', borderRadius: '8px', background: mode === 'pen' ? '#fbbf24' : 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Pen size={20} /></button>
                <button onClick={() => setMode('eraser')} style={{ padding: '8px', borderRadius: '8px', background: mode === 'eraser' ? '#fbbf24' : 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}><Eraser size={20} /></button>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ border: 'none', width: '40px', height: '40px', cursor: 'pointer', background: 'transparent' }} />
                <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} style={{ width: '100px' }} />
                <button onClick={clearCanvas} style={{ padding: '8px', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: '#ef4444' }}><RefreshCw size={20} /></button>
            </div>

            {/* Área de Desenho */}
            <div style={{ flex: 1, border: '2px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', cursor: mode === 'pen' ? 'crosshair' : 'cell', touchAction: 'none', backgroundColor: '#fff' }}>
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: '100%' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button onClick={onCancel} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #94a3b8', background: 'transparent', fontWeight: 'bold' }}>Cancelar</button>
                <button onClick={handleSave} style={{ flex: 2, padding: '15px', borderRadius: '10px', border: 'none', background: '#fbbf24', color: '#0f172a', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Save size={20} /> Salvar Anotações</button>
            </div>
        </div>
    );
};

export default LousaDigital;