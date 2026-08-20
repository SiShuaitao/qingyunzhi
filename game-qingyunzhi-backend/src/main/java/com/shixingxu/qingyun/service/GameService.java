package com.shixingxu.qingyun.service;

import com.shixingxu.qingyun.entity.Game;

import java.util.List;

public interface GameService {

    /** 获取所有已上线作品，按 sort 升序 */
    List<Game> listOnline();

    /** 获取首页游戏（第一条） */
    Game getFirst();
}
