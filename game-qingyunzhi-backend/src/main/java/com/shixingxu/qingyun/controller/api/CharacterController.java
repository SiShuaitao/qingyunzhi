package com.shixingxu.qingyun.controller.api;

import com.shixingxu.qingyun.common.Result;
import com.shixingxu.qingyun.entity.Character;
import com.shixingxu.qingyun.service.CharacterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final CharacterService characterService;

    @GetMapping
    public Result<List<Character>> list() {
        return Result.success(characterService.listOnline());
    }
}
