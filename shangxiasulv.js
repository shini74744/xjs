function updateOne(elem, type) {
  const currentText = cleanText(elem.textContent);

  let speed = 0;
  let parsed = null;

  // 如果当前文本就是本脚本上次写入的结果，直接使用缓存速度，避免 Mbps 被反复换算
  if (
    elem.dataset.shliSpeedOutput &&
    currentText === elem.dataset.shliSpeedOutput &&
    elem.dataset.shliSpeedBytes
  ) {
    speed = Number(elem.dataset.shliSpeedBytes) || 0;
  } else {
    parsed = parseSpeed(currentText);
    if (!parsed) return;

    speed = parsed.bytesPerSecond;

    // 只转换哪吒原始的 B/s、K/s、M/s、G/s
    // 如果已经是 Mbps / Gbps，就不再重复改文本
    if (parsed.kind === 'byte') {
      const newText = formatMbps(speed);

      elem.dataset.shliSpeedBytes = String(speed);
      elem.dataset.shliSpeedOutput = cleanText(newText);

      // 数值直接替换，不做动画
      if (currentText !== cleanText(newText)) {
        elem.textContent = newText;
      }
    } else {
      elem.dataset.shliSpeedBytes = String(speed);
      elem.dataset.shliSpeedOutput = currentText;
    }
  }

  // 保留颜色、阴影、缩放的平滑变化
  // 这个不会让数值线性变化，textContent 仍然是直接替换
  elem.style.transition = 'color 0.35s ease, transform 0.35s ease, text-shadow 0.35s ease';

  elem.style.color = speedToColor(speed, MAX_SPEED, type);

  applyEffect(elem, speed, type);
}
