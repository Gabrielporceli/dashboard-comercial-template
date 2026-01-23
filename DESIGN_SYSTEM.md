# Design System - Dashboard Comercial

## Paleta de Cores Oficial

### Cores Primárias

#### Absolute Black
- **HEX**: `#000000`
- **HSL**: `hsl(0, 0%, 0%)`
- **Uso**: Background principal no Dark Mode, texto no Light Mode

#### Off-White
- **HEX**: `#F4F4F4`
- **HSL**: `hsl(0, 0%, 96%)`
- **Uso**: Background principal no Light Mode, texto no Dark Mode

#### Purple (Marca)
- **HEX**: `#6829C0`
- **HSL**: `hsl(270, 67%, 46%)`
- **Uso**: Cor principal da marca, botões primários, destaques, títulos importantes

---

## Temas

### Light Mode (Padrão em navegadores claros)

- **Background**: Off-White (`#F4F4F4`)
- **Foreground (texto)**: Absolute Black (`#000000`)
- **Cards/Containers**: Branco puro (`#FFFFFF`)
- **Primary (destaques)**: Purple (`#6829C0`)
- **Bordas**: Black com 10% de opacidade
- **Hover em Purple**: Purple mais escuro (automático)

### Dark Mode (Padrão em navegadores escuros)

- **Background**: Absolute Black (`#000000`)
- **Foreground (texto)**: Off-White (`#F4F4F4`)
- **Cards/Containers**: Preto 5% mais claro (`hsl(0, 0%, 5%)`)
- **Primary (destaques)**: Purple (`#6829C0`)
- **Bordas**: Off-White com 15% de opacidade
- **Hover em Purple**: Purple mais claro (automático)

---

## Componentes

### Botões

#### Primário (Purple)
```tsx
<Button variant="default">Ação Principal</Button>
<Button variant="purple">Ação com Purple</Button>
```
- Background: Purple
- Texto: Off-White
- Hover: Purple 90%

#### Secundário
```tsx
<Button variant="purple-ghost">Ação Secundária</Button>
```
- Background: Transparente
- Texto: Purple
- Hover: Purple 10%

#### Outline Purple
```tsx
<Button variant="purple-outline">Ação Outline</Button>
```
- Background: Transparente
- Borda: Purple (2px)
- Texto: Purple
- Hover: Background Purple + texto Off-White

### Badges

#### Status
- **Qualificado**: Verde com background 20% opaco
- **Desqualificado**: Vermelho com background 20% opaco
- **Sem Info**: Muted com 50% opaco

#### Plataformas
- **Google/Meta**: Purple com variação de opacidade
- **Sem Info**: Muted padrão

### Tipografia

#### Hierarquia Visual

1. **Títulos Principais (H1)**
   - Cor: Purple (`text-primary`)
   - Peso: Bold (700)
   - Tamanho: 3xl (30px)

2. **Subtítulos (H2/H3)**
   - Cor: Purple (`text-primary`)
   - Peso: Semibold (600)
   - Tamanho: lg-xl

3. **Texto de Parágrafo**
   - Cor: Foreground com 80% opacidade
   - Peso: Normal (400)
   - Tamanho: sm-base

4. **Texto Muted**
   - Cor: `text-muted-foreground`
   - Uso: Labels, descrições secundárias

---

## Cards e Containers

### Card Padrão
```tsx
<Card className="p-6">
  {/* conteúdo */}
</Card>
```
- Background: `bg-card` (branco no light, preto 5% no dark)
- Borda: Sutil com `border-border`
- Sombra: Suave para profundidade
- Border-radius: 0.5rem

### Card com Destaque
```tsx
<div className="bg-primary/10 p-3 rounded-lg">
  <Icon className="text-primary" />
</div>
```
- Background: Purple com 10% de opacidade
- Ícone: Purple sólido

---

## Inputs e Forms

### Input Padrão
- Background: 10% de contraste em relação ao background
- Borda: `border-input`
- Border-radius: 6-8px
- Focus: Ring Purple
- Texto: `text-foreground`

### Select/Dropdown
- Mesmo estilo do Input
- Highlight: Purple ao selecionar

---

## Ícones

### Cores por Tema
- **Light Mode**: Absolute Black ou Purple para destaques
- **Dark Mode**: Off-White ou Purple para destaques

### Tamanhos Padrão
- Pequeno: `w-4 h-4`
- Médio: `w-5 h-5`
- Grande: `w-6 h-6` ou `w-8 h-8`

---

## Detecção Automática de Tema

O sistema detecta automaticamente o tema do navegador usando:
```javascript
window.matchMedia("(prefers-color-scheme: dark)")
```

O hook `useTheme()` aplica a classe `.dark` no elemento `<html>` quando o usuário está em modo escuro.

---

## Atmosfera da Marca

### Princípios
1. **Purple é a energia**: Sempre use Purple para destacar ações e identidade
2. **Black e Off-White são a base**: Neutralidade e sofisticação
3. **Modernidade**: Design limpo, bordas suaves, espaçamentos generosos
4. **Profundidade**: Sombras sutis, hierarquia clara
5. **Clareza**: Alto contraste, legibilidade em primeiro lugar

### Personalidade
- Profissional
- Moderna
- Confiável
- Energética (através do Purple)
- Sofisticada
