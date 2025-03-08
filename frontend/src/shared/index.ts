export const formatDate = (isoString) => {
    const date = new Date(isoString);

    const options = { timeZone: 'Asia/Kolkata' };
    const day = date.toLocaleString('en-IN', { day: '2-digit', ...options });
    const month = date.toLocaleString('en-IN', {
      month: '2-digit',
      ...options,
    });
    const year = date.toLocaleString('en-IN', { year: 'numeric', ...options });

    let hours = date
      .toLocaleString('en-IN', { hour: '2-digit', hour12: true, ...options })
      .split(' ')[0];
    let minutes = date.toLocaleString('en-IN', {
      minute: '2-digit',
      ...options,
    });
    let ampm = date
      .toLocaleString('en-IN', { hour: '2-digit', hour12: true, ...options })
      .split(' ')[1]
      .toLowerCase();

    return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
  };