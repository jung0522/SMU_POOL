import socketChatController from '../srcs/controllers/socketChat.controller.js';
import socketUserController from '../srcs/controllers/socketUser.controller.js';

const setupSocketIO = (io) => {
    io.on("connection", async (socket) => {
        console.log("Client connected:", socket.id);

        // 로그인 이벤트 처리
        socket.on("login", async (data, cb) => {
            try {
                const [name, phoneNum] = data;
                let user = await socketUserController.isUser(name, phoneNum);
                if(user){
                    // 있었던 사용자면 토큰값 변경
                    user = await socketUserController.updateToken(name, phoneNum, socket.id);
                }
                else{
                    // 없었던 사용자면 사용자 생성
                    user = await socketUserController.saveUser(name, phoneNum, socket.id);
                }

                if (!user.socketIsAdmin) {
                    socket.join(phoneNum);
                    const welcomeMessage = {
                        chat: `${user.name} 님이 채팅방에 입장했습니다.`,
                        user: { id: null, name: "system" },
                    };
                    io.to(phoneNum).emit("message", welcomeMessage);
                    cb({ ok: true, data: user });
                } else {
                    // 관리자는 모든 방에 접속 가능 하도록
                    const rooms = io.sockets.adapter.rooms;
                    for (let room of rooms) {
                        socket.join(room);
                    }
                }


            } catch (err) {
                cb({ ok: false, error: err.message });
            }
        });

        // 메시지 전송 이벤트 처리
        socket.on("sendMessage", async (message, cb) => {
            try {
                const user = await socketUserController.checkUserByToken(socket.id);
                const newMessage = await socketChatController.saveChat(message, user);
                socket.join(user.socketUserPhone);
                io.to(user.socketUserPhone).emit("message", newMessage);
                cb({ ok: true });
            } catch (err) {
                cb({ ok: false, error: err.message });
            }
        });

        // 연결 해제 이벤트 처리
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

export default setupSocketIO;
