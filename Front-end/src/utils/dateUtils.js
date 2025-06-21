export function formatDateTime(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  let hours = date.getHours(); // Không padStart để bỏ số 0 đầu
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');

  if (hours === 0 && minutes === '00' && seconds === '00') {
    hours = 24;
  }

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatEventDateAndTimeRange(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const year = start.getFullYear();
  const month = `${start.getMonth() + 1}`.padStart(2, "0");
  const day = `${start.getDate()}`.padStart(2, "0");

  const startHour = `${start.getHours()}`.padStart(2, "0");
  const startMinute = `${start.getMinutes()}`.padStart(2, "0");

  let endHour = end.getHours();
  let endMinute = `${end.getMinutes()}`.padStart(2, "0");

  if (
    endHour === 0 &&
    end.getMinutes() === 0 &&
    end.getSeconds() === 0
  ) {
    endHour = 24;
    endMinute = "00";
  } else {
    endHour = `${endHour}`.padStart(2, "0");
  }

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${startHour}:${startMinute} – ${endHour}:${endMinute}`;

  return { dateStr, timeStr };
}

