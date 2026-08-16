export function getTimeBasedGreeting(): { greeting: string; period: string } {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', period: 'morning' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', period: 'afternoon' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good evening', period: 'evening' };
  } else {
    return { greeting: 'Good night', period: 'night' };
  }
}
