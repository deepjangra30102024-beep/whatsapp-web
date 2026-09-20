export const currentUser = {
  id: 0,
  name: "Current User",
  avatar: "https://i.pravatar.cc/150?img=11",
};

export const contactsData = [
  {
    id: 1,
    name: "Alice Smith",
    avatar: "https://i.pravatar.cc/150?img=5",
    lastSeen: "today at 10:30 AM",
    messages: [
      { id: 101, text: "Hey! Are we still on for lunch?", time: "10:00 AM", sender: 1 },
      { id: 102, text: "Yes, definitely. See you at 12:30.", time: "10:05 AM", sender: 0 },
      { id: 103, text: "Perfect, I'll be there.", time: "10:15 AM", sender: 1 }
    ]
  },
  {
    id: 2,
    name: "Bob Johnson",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastSeen: "yesterday",
    messages: [
      { id: 201, text: "Did you send the report?", time: "Yesterday", sender: 2 },
      { id: 202, text: "Just sent it via email.", time: "Yesterday", sender: 0 }
    ]
  },
  {
    id: 3,
    name: "Charlie Davis",
    avatar: "https://i.pravatar.cc/150?img=33",
    lastSeen: "online",
    messages: [
      { id: 301, text: "Can you review my PR?", time: "9:00 AM", sender: 3 },
      { id: 302, text: "Sure, I'll take a look in 10 mins.", time: "9:05 AM", sender: 0 },
      { id: 303, text: "Thanks!", time: "9:06 AM", sender: 3 }
    ]
  },
  {
    id: 4,
    name: "Diana Prince",
    avatar: "https://i.pravatar.cc/150?img=47",
    lastSeen: "today at 8:00 AM",
    messages: [
      { id: 401, text: "Happy birthday!!! 🎂", time: "8:00 AM", sender: 4 },
      { id: 402, text: "Thank you so much! 😊", time: "8:15 AM", sender: 0 }
    ]
  },
  {
    id: 5,
    name: "Design Team",
    avatar: "https://i.pravatar.cc/150?img=68",
    lastSeen: "online",
    isGroup: true,
    messages: [
      { id: 501, text: "I've uploaded the new mockups.", time: "11:20 AM", sender: 1 },
      { id: 502, text: "They look great, just a few tweaks on the contrast.", time: "11:30 AM", sender: 2 },
      { id: 503, text: "Will do.", time: "11:35 AM", sender: 1 }
    ]
  },
  {
    id: 6,
    name: "Eve Adams",
    avatar: "https://i.pravatar.cc/150?img=20",
    lastSeen: "last week",
    messages: [
      { id: 601, text: "Let's catch up soon.", time: "Oct 12", sender: 6 }
    ]
  }
];
