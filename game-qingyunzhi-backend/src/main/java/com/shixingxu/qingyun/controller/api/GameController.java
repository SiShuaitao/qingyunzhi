package com.shixingxu.qingyun.controller.api;

import com.shixingxu.qingyun.common.Result;
import com.shixingxu.qingyun.entity.Game;
import com.shixingxu.qingyun.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /** 获取青云志游戏详情（首条） */
    @GetMapping("/game")
    public Result<Game> detail() {
        Game game = gameService.getFirst();
        if (game == null) {
            throw new IllegalArgumentException("游戏信息尚未配置");
        }
        return Result.success(game);
    }

    /** 获取所有已上线游戏 */
    @GetMapping("/games")
    public Result<List<Game>> list() {
        return Result.success(gameService.listOnline());
    }
}
