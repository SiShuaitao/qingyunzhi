package com.shixingxu.qingyun.controller.api;

import com.shixingxu.qingyun.common.Result;
import com.shixingxu.qingyun.entity.Sect;
import com.shixingxu.qingyun.service.SectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sects")
@RequiredArgsConstructor
public class SectController {

    private final SectService sectService;

    @GetMapping
    public Result<List<Sect>> list() {
        return Result.success(sectService.listOnline());
    }
}
