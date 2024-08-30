const isDateExpired = (expiresAt: Date) => new Date(expiresAt).getTime() < new Date().getTime();

export default isDateExpired;